/**
 * Talking to the robot simulator, from the page.
 *
 * Mirrors PythonRunner deliberately: one worker, a strict run timeout, and
 * termination as the only reliable way to stop runaway Python. A learner
 * writing `while True:` is not a risk to plan for, it is a certainty, and a
 * worker you cannot kill is a tab you cannot rescue.
 *
 * Loading is slow and running is fast, so the two have very different budgets.
 * The load pulls Pyodide (~10 MB) and MuJoCo (~2.4 MB gzipped) once, then
 * every run afterwards is a fraction of a second.
 */
import { GO2_MODEL_XML } from "@/content/go2-model";

/** Strict. Starts only once Python and physics are ready. */
export const SIM_RUN_TIMEOUT_MS = 15_000;
/** Generous: covers the one-off runtime download on a slow school connection. */
export const SIM_LOAD_TIMEOUT_MS = 180_000;

export interface GeomSpec {
  type: number;
  size: [number, number, number];
  rgba: [number, number, number, number];
  body: number;
  pos: [number, number, number];
  quat: [number, number, number, number];
}

export interface SimInfo {
  nbody: number;
  ngeom: number;
  geoms: GeomSpec[];
}

export interface SimState {
  height: number;
  /** Metres travelled forward (+) or backward (-). */
  x: number;
  /** Metres drifted sideways -- a straight walk keeps this near zero. */
  y: number;
  time: number;
  joints: number[];
  tilt: [number, number];
}

export interface RunResult {
  ok: boolean;
  error: string | null;
  output: string;
  /** Flat [frame][body][x,y,z,qw,qx,qy,qz]. */
  frames: Float32Array;
  frameCount: number;
  nbody: number;
  /** The recording hit its ceiling -- the learner's loop ran very long. */
  truncated: boolean;
  state: SimState;
}

/**
 * Can this browser run the simulator at all?
 *
 * Checked before anything heavy is downloaded, because the honest answer on a
 * device that cannot do it is to show the video of the real robot instead --
 * not a spinner, and definitely not 12 MB followed by an error.
 */
export function simSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof WebAssembly !== "object") return false;
  if (typeof Worker === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return false;
  } catch {
    return false;
  }
  return true;
}

interface Pending {
  resolve: (v: never) => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class SimRunner {
  private worker: Worker | null = null;
  private pending = new Map<number, Pending>();
  private nextId = 1;
  private ready: Promise<SimInfo> | null = null;

  /** Start loading now, so the download overlaps the learner reading. */
  warmUp(): Promise<SimInfo> {
    if (!this.ready) this.ready = this.boot();
    return this.ready;
  }

  private boot(): Promise<SimInfo> {
    this.spawn();
    return this.send<{ info: SimInfo }>(
      { kind: "init", xml: GO2_MODEL_XML },
      SIM_LOAD_TIMEOUT_MS,
      "the simulator took too long to load",
    ).then((r) => r.info);
  }

  private spawn() {
    this.worker = new Worker("/sim-worker.js", { type: "module" });
    this.worker.onmessage = (ev: MessageEvent) => {
      const { id, ...rest } = ev.data as { id: number };
      const p = this.pending.get(id);
      if (!p) return;
      clearTimeout(p.timer);
      this.pending.delete(id);
      const r = rest as { ok?: boolean; error?: string; kind?: string };
      // A "run" carries the learner's own error inside the result -- their
      // Python raising is an ordinary outcome, not a broken simulator. Any
      // other message failing means the runtime itself did not come up.
      if (r.ok === false && !("frames" in r)) {
        p.reject(new Error(r.error || "the simulator failed to start"));
        return;
      }
      (p.resolve as (v: unknown) => void)(rest);
    };
    this.worker.onerror = (e) => this.failAll(new Error(e.message || "simulator crashed"));
  }

  private failAll(err: Error) {
    for (const [, p] of this.pending) {
      clearTimeout(p.timer);
      p.reject(err);
    }
    this.pending.clear();
  }

  private send<T>(msg: Record<string, unknown>, timeoutMs: number, timeoutMessage: string): Promise<T> {
    if (!this.worker) this.spawn();
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        // The only way to stop Python mid-loop. The next call spawns a fresh
        // worker, which also means a fresh (and therefore reloading) runtime.
        this.hardReset();
        reject(new Error(timeoutMessage));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer } as unknown as Pending);
      this.worker!.postMessage({ ...msg, id });
    });
  }

  /**
   * Run one cell.
   * @param keepState  true for cells after the first in a part, so the robot's
   *                   pose and the learner's own variables survive.
   */
  async run(code: string, keepState = false): Promise<RunResult> {
    await this.warmUp();
    return this.send<RunResult>(
      { kind: "run", code, keepState },
      SIM_RUN_TIMEOUT_MS,
      "your code took too long -- is there a loop that never ends?",
    );
  }

  /**
   * Ask a yes/no question of the world the learner's code just made.
   *
   * Evaluated in their namespace, so a check can read the robot AND anything
   * they defined. A check that itself throws returns false rather than
   * exploding -- a bug in my question must never read as their wrong answer.
   */
  async check(expression: string): Promise<{ pass: boolean; checkError?: string }> {
    await this.warmUp();
    return this.send<{ pass: boolean; checkError?: string }>(
      { kind: "check", code: expression },
      SIM_RUN_TIMEOUT_MS,
      "checking your answer took too long",
    );
  }

  /** Put the robot back on the floor and forget every variable. */
  async reset(): Promise<void> {
    await this.warmUp();
    await this.send({ kind: "reset" }, SIM_RUN_TIMEOUT_MS, "reset timed out");
  }

  /** Kill the worker outright. Everything reloads on next use. */
  hardReset() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    this.failAll(new Error("the simulator was stopped"));
  }

  dispose() {
    this.hardReset();
  }
}
