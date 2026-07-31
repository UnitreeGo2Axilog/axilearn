"use client";

/**
 * Owns the Python worker: spawning it, sending code, enforcing a time limit,
 * and killing it when a program will not stop.
 *
 * TWO SEPARATE CLOCKS, and keeping them separate is the whole correctness
 * story here. Starting Python means downloading ~10MB of WebAssembly, which
 * on an ordinary connection takes far longer than any sane limit on how long
 * a beginner's six-line program should run. An earlier version used one timer
 * for both, and the result was a sandbox that could never work: the first Run
 * hit the execution limit while the runtime was still downloading, the
 * timeout killed the worker mid-download, the next Run started the download
 * from scratch, and the learner was told their program "ran too long" about
 * code that had never executed at all.
 *
 *   LOAD_TIMEOUT_MS  -- generous, covers the one-off runtime download.
 *   RUN_TIMEOUT_MS   -- strict, and only starts once Python is ready to run.
 *
 * The run timer is what stops `while True:`. Python inside WASM runs
 * synchronously and cannot be interrupted from outside once it starts, so the
 * only real way to end an infinite loop is to destroy the worker running it.
 * That is why the runtime is warmed as soon as a worker spawns: throwing one
 * away also throws away its loaded Python, and the next run should not pay
 * for that from a standing start.
 */

import type { ChallengeTest } from "@/content/schema";

/** How long a learner's program may run before it is assumed to be stuck. */
export const RUN_TIMEOUT_MS = 10_000;
/** How long the one-off Python download may take before we call it failed. */
export const LOAD_TIMEOUT_MS = 120_000;

/** One graded test case coming back from a challenge submission. */
export interface TestCaseResult {
  ok: boolean;
  /** repr() of what the learner's code returned, or null if it raised. */
  actual: string | null;
  /** The exception for this case, if it raised. */
  error: string | null;
}

export interface RunResult {
  stdout: string;
  error: string | null;
  /** The program was killed for running too long -- almost always a loop. */
  timedOut: boolean;
  /** Python itself never started: offline, blocked CDN, or a worker failure. */
  loadFailed: boolean;
  /** Per-case results for a graded submission; null for a plain run, and also
   *  null when the code failed before any case could be reached (a syntax
   *  error, say) -- "no cases ran" and "every case failed" are different
   *  outcomes and the UI needs to tell them apart. */
  cases: TestCaseResult[] | null;
}

type Pending = {
  resolve: (result: RunResult) => void;
  timer: ReturnType<typeof setTimeout>;
};

export class PythonRunner {
  private worker: Worker | null = null;
  private pending = new Map<number, Pending>();
  private nextId = 1;

  private ready = false;
  private readyPromise!: Promise<void>;
  private markReady!: () => void;
  private markLoadFailed!: (reason: Error) => void;
  private listeners = new Set<() => void>();

  constructor() {
    this.spawn();
  }

  private spawn() {
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.markReady = () => {
        this.ready = true;
        this.listeners.forEach((fn) => fn());
        resolve();
      };
      this.markLoadFailed = reject;
    });
    // Nothing may await this promise before a rejection handler is attached,
    // and run() attaches one lazily -- so absorb the rejection here to keep
    // it from surfacing as an unhandled promise rejection in the console.
    this.readyPromise.catch(() => {});

    try {
      this.worker = new Worker("/pyodide-worker.js");
    } catch (err) {
      this.markLoadFailed(err as Error);
      return;
    }

    this.worker.onmessage = (event: MessageEvent) => {
      const data = event.data ?? {};
      if (data.type === "ready") {
        this.markReady();
        return;
      }
      if (data.type === "load-error") {
        this.markLoadFailed(new Error(String(data.message ?? "unknown")));
        return;
      }
      if (data.type !== "result") return;
      const entry = this.pending.get(data.id);
      if (!entry) return; // already timed out and reported
      clearTimeout(entry.timer);
      this.pending.delete(data.id);
      entry.resolve({
        stdout: data.stdout ?? "",
        error: data.error ?? null,
        timedOut: false,
        loadFailed: false,
        cases: data.cases ?? null,
      });
    };

    // Without this an exception inside the worker is completely silent: the
    // pending run would just sit there until the execution timer fired and
    // then blame the learner's code for a failure that was ours.
    this.worker.onerror = (event: ErrorEvent) => {
      const reason = new Error(event.message || "worker failed");
      if (!this.ready) this.markLoadFailed(reason);
      this.failAllPending(reason.message);
    };
  }

  private failAllPending(message: string) {
    this.pending.forEach(({ resolve, timer }) => {
      clearTimeout(timer);
      resolve({ stdout: "", error: message, timedOut: false, loadFailed: true, cases: null });
    });
    this.pending.clear();
  }

  /** Kill the current worker and start a clean one -- the only way to stop a
   *  synchronous runaway, and it also clears any half-defined Python state
   *  the killed run left behind. */
  private restart() {
    this.worker?.terminate();
    this.spawn();
  }

  get isReady() {
    return this.ready;
  }

  onReady(fn: () => void): () => void {
    if (this.ready) fn();
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Resolves once Python can actually execute; rejects if it never loads. */
  private waitForReady(): Promise<void> {
    if (this.ready) return Promise.resolve();
    return Promise.race([
      this.readyPromise,
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("timed out loading Python")), LOAD_TIMEOUT_MS),
      ),
    ]);
  }

  /** Just run it and show what it printed. */
  run(code: string): Promise<RunResult> {
    return this.send({ type: "run", code });
  }

  /** Run it, then check it against a challenge's test cases. */
  grade(code: string, tests: ChallengeTest[]): Promise<RunResult> {
    return this.send({ type: "grade", code, tests });
  }

  private async send(payload: { type: "run" | "grade"; code: string; tests?: ChallengeTest[] }) {
    if (!this.worker) this.spawn();

    // Wait for the runtime BEFORE the execution clock starts, so a slow
    // download is never mistaken for a slow program.
    try {
      await this.waitForReady();
    } catch (err) {
      return {
        stdout: "",
        error: (err as Error).message,
        timedOut: false,
        loadFailed: true,
        cases: null,
      };
    }

    const id = this.nextId++;
    return new Promise<RunResult>((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.restart();
        resolve({ stdout: "", error: null, timedOut: true, loadFailed: false, cases: null });
      }, RUN_TIMEOUT_MS);

      this.pending.set(id, { resolve, timer });
      this.worker!.postMessage({ ...payload, id });
    });
  }

  dispose() {
    this.pending.forEach((p) => clearTimeout(p.timer));
    this.pending.clear();
    this.listeners.clear();
    this.worker?.terminate();
    this.worker = null;
  }
}
