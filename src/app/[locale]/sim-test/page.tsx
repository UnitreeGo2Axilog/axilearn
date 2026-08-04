"use client";

/**
 * A bench for the simulator runtime.
 *
 * Not a lesson and not linked from anywhere -- it exists so the runtime can be
 * driven and looked at on its own, before any course content depends on it.
 * The notebook the learners actually see is built on top of this in Phase 2.
 */
import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Loader2 } from "lucide-react";
import { SimRunner, simSupported, type RunResult, type SimInfo } from "@/lib/sim-runner";
import { RobotViewport } from "@/components/robot-viewport";

const SAMPLE = `# Tell the robot what to do, one line at a time.
robot.stand_up()
robot.wait(1)

print("height:", round(robot.height, 3))
print("standing?", robot.is_standing)
`;

export default function SimTestPage() {
  const runner = useRef<SimRunner | null>(null);
  const [info, setInfo] = useState<SimInfo | null>(null);
  const [code, setCode] = useState(SAMPLE);
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [supported] = useState(() => (typeof window === "undefined" ? true : simSupported()));

  useEffect(() => {
    if (!supported) return;
    const r = new SimRunner();
    runner.current = r;
    r.warmUp()
      .then(setInfo)
      .catch((e: Error) => setErr(e.message));
    return () => r.dispose();
  }, [supported]);

  const run = async (keepState: boolean) => {
    if (!runner.current) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await runner.current.run(code, keepState);
      setResult(res);
      if (res.error) setErr(res.error);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!supported) {
    return <div className="p-8 text-sm text-muted">This browser cannot run the simulator.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-extrabold text-strong">Simulator bench</h1>
      <p className="mb-5 text-sm text-muted" data-testid="status">
        {info ? `ready — ${info.nbody} bodies, ${info.ngeom} geoms` : "loading…"}
      </p>

      <RobotViewport geoms={info?.geoms ?? null} result={result} accent="#22d3ee" className="mb-4" />

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={9}
        className="w-full rounded-xl border p-3 font-robot text-[13px] leading-relaxed text-main"
        style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
      />

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => run(false)}
          disabled={!info || busy}
          data-testid="run"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black disabled:opacity-40"
          style={{ background: "#22d3ee", color: "var(--surface-solid)" }}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run
        </button>
        <button
          onClick={() => run(true)}
          disabled={!info || busy}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40"
          style={{ borderColor: "var(--border-strong)" }}
        >
          Run keeping state
        </button>
        <button
          onClick={() => runner.current?.reset().then(() => setResult(null))}
          disabled={!info || busy}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {err && (
        <pre
          data-testid="error"
          className="mt-3 overflow-x-auto rounded-xl border p-3 font-robot text-xs"
          style={{ borderColor: "#f87171", color: "#f87171" }}
        >
          {err}
        </pre>
      )}

      {result && (
        <pre
          data-testid="output"
          className="mt-3 overflow-x-auto rounded-xl border p-3 font-robot text-xs text-main"
          style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
        >
          {result.output || "(no output)"}
          {"\n---\n"}
          {`frames ${result.frameCount}  height ${result.state.height.toFixed(3)}  time ${result.state.time.toFixed(2)}s`}
        </pre>
      )}
    </div>
  );
}
