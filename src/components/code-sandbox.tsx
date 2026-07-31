"use client";

/**
 * The Learning Studio's working half: a Python editor and the output of
 * running it, replacing the "coming soon" placeholders the lesson page shipped
 * with.
 *
 * Python runs entirely in the learner's own browser (Pyodide, in a Web
 * Worker), so there is no server executing anybody's code -- which matters
 * for a platform aimed at minors on a free plan: nothing to secure, nothing
 * to bill, nothing to abuse. The tradeoff is a first-run download of roughly
 * 10MB for the Python runtime, so it is loaded lazily and its progress is
 * shown honestly rather than hidden behind a spinner that looks broken.
 *
 * The runner is created once per mount and disposed on unmount; see
 * python-runner.ts for why a runaway loop is survivable here.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { AlertTriangle, Loader2, Play, RotateCcw, Terminal } from "lucide-react";
import { PythonRunner, RUN_TIMEOUT_MS, type RunResult } from "@/lib/python-runner";
import { useTheme } from "@/lib/theme";
import { useT } from "@/i18n/use-t";

export function CodeSandbox({ starterCode }: { starterCode: string }) {
  const t = useT();
  const { theme } = useTheme();
  const [code, setCode] = useState(starterCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const runnerRef = useRef<PythonRunner | null>(null);

  useEffect(() => {
    const runner = new PythonRunner();
    runnerRef.current = runner;
    const off = runner.onReady(() => setReady(true));
    return () => {
      off();
      runner.dispose();
      runnerRef.current = null;
    };
  }, []);

  const run = useCallback(async () => {
    const runner = runnerRef.current;
    if (!runner) return;
    setRunning(true);
    setResult(null);
    try {
      setResult(await runner.run(code));
    } finally {
      setRunning(false);
      // A timeout kills the worker, so the next run starts a cold runtime.
      setReady(runner.isReady);
    }
  }, [code]);

  return (
    <>
      {/* workspace */}
      <section className="panel panel-glow rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("lesson.workspace")}
          </h2>
          <div className="flex items-center gap-2">
            {code !== starterCode && (
              <button
                onClick={() => setCode(starterCode)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-faint transition hover:opacity-80"
              >
                <RotateCcw className="h-3 w-3" />
                {t("lesson.reset")}
              </button>
            )}
            <button
              onClick={run}
              disabled={running}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-black uppercase tracking-wide transition disabled:opacity-50"
              style={{ background: "var(--cleared)", color: "var(--surface-solid)" }}
            >
              {running ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              {t("lesson.run")}
            </button>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-lg border"
          style={{ borderColor: "var(--border)" }}
        >
          <CodeMirror
            value={code}
            height="220px"
            theme={theme === "dark" ? oneDark : undefined}
            extensions={[python()]}
            onChange={setCode}
            basicSetup={{
              lineNumbers: true,
              foldGutter: false,
              autocompletion: false, // a beginner does not need a popup guessing at them
              highlightActiveLine: true,
            }}
          />
        </div>

        {!ready && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-faint">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("lesson.pythonLoading")}
          </p>
        )}
      </section>

      {/* output */}
      <section className="panel rounded-xl p-4">
        <h2
          className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide"
          style={{ color: "var(--neon)" }}
        >
          <Terminal className="h-3.5 w-3.5" />
          {t("lesson.output")}
        </h2>

        <div
          className="min-h-[220px] overflow-auto rounded-lg border p-3 font-mono text-xs leading-relaxed"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}
        >
          {running ? (
            <span className="inline-flex items-center gap-2 text-faint">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {ready ? t("lesson.running") : t("lesson.pythonLoading")}
            </span>
          ) : !result ? (
            <span className="text-faint">{t("lesson.outputEmpty")}</span>
          ) : result.loadFailed ? (
            <span className="inline-flex items-start gap-2" style={{ color: "var(--reward)" }}>
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="font-sans">{t("lesson.pythonFailed")}</span>
            </span>
          ) : result.timedOut ? (
            <span className="inline-flex items-start gap-2" style={{ color: "var(--reward)" }}>
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="font-sans">
                {t("lesson.tooLong").replace("{seconds}", String(RUN_TIMEOUT_MS / 1000))}
              </span>
            </span>
          ) : (
            <>
              {result.stdout && (
                <pre className="whitespace-pre-wrap text-main">{result.stdout}</pre>
              )}
              {result.error && (
                <pre
                  className="mt-2 whitespace-pre-wrap font-semibold"
                  style={{ color: "var(--reward)" }}
                >
                  {result.error}
                </pre>
              )}
              {!result.stdout && !result.error && (
                <span className="text-faint">{t("lesson.ranNoOutput")}</span>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
