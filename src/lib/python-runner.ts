"use client";

/**
 * Owns the Python worker: spawning it, sending code, enforcing a time limit,
 * and killing it when a program will not stop.
 *
 * The timeout is the whole point. Python inside WASM runs synchronously and
 * cannot be interrupted from the outside once it starts -- there is no
 * "cancel" to send it. The only real way to stop `while True:` is to destroy
 * the worker running it, which is exactly what happens here: on timeout the
 * worker is terminated, a fresh one is spawned for next time, and the learner
 * gets a plain sentence about the loop rather than a dead tab.
 *
 * That is also why the runtime is warmed on construction: throwing away a
 * worker means throwing away its loaded Pyodide, so the next run would
 * otherwise pay the full ~10MB startup again at the worst possible moment.
 */

export const RUN_TIMEOUT_MS = 10_000;

export interface RunResult {
  stdout: string;
  error: string | null;
  /** True when the program was killed for running too long. */
  timedOut: boolean;
}

type Pending = {
  resolve: (result: RunResult) => void;
  timer: ReturnType<typeof setTimeout>;
};

export class PythonRunner {
  private worker: Worker | null = null;
  private pending = new Map<number, Pending>();
  private nextId = 1;
  private readyListeners = new Set<() => void>();
  private ready = false;

  constructor() {
    this.spawn();
  }

  private spawn() {
    this.worker = new Worker("/pyodide-worker.js");
    this.worker.onmessage = (event: MessageEvent) => {
      const data = event.data ?? {};
      if (data.type === "ready") {
        this.ready = true;
        this.readyListeners.forEach((fn) => fn());
        return;
      }
      if (data.type !== "result") return;
      const entry = this.pending.get(data.id);
      if (!entry) return; // already timed out and reported
      clearTimeout(entry.timer);
      this.pending.delete(data.id);
      entry.resolve({ stdout: data.stdout ?? "", error: data.error ?? null, timedOut: false });
    };
  }

  /** Kill the current worker and start a clean one -- the only way to stop
   *  a synchronous runaway, and it also clears any half-defined Python state
   *  the failed run left behind. */
  private restart() {
    this.worker?.terminate();
    this.ready = false;
    this.spawn();
  }

  get isReady() {
    return this.ready;
  }

  onReady(fn: () => void): () => void {
    if (this.ready) fn();
    this.readyListeners.add(fn);
    return () => this.readyListeners.delete(fn);
  }

  run(code: string): Promise<RunResult> {
    if (!this.worker) this.spawn();
    const id = this.nextId++;

    return new Promise<RunResult>((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.restart();
        resolve({ stdout: "", error: null, timedOut: true });
      }, RUN_TIMEOUT_MS);

      this.pending.set(id, { resolve, timer });
      this.worker!.postMessage({ type: "run", id, code });
    });
  }

  dispose() {
    this.pending.forEach((p) => clearTimeout(p.timer));
    this.pending.clear();
    this.readyListeners.clear();
    this.worker?.terminate();
    this.worker = null;
  }
}
