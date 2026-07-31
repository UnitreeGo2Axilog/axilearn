"use client";

/**
 * A coding challenge: read the problem, write the function, submit, and get
 * graded against test cases -- the HackerRank shape, run in our own
 * in-browser Python.
 *
 * Run and Submit are deliberately separate. Run just executes and shows what
 * printed, for poking at an idea; Submit grades. Forcing every experiment
 * through a pass/fail verdict makes people afraid to experiment.
 *
 * Some cases are shown as worked examples and some are hidden. Hidden ones
 * are reported only as pass/fail with no inputs revealed: a learner who can
 * see every case can special-case their way to green without solving
 * anything, which teaches precisely the wrong lesson. Visible failures show
 * what the code actually returned, because "expected 5, got -1" is the
 * single most useful sentence in debugging.
 */
import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { AlertTriangle, Check, Loader2, Play, RotateCcw, Send, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";
import { markChallengeSolved, unmarkChallengeSolved } from "@/lib/progress";
import { PythonRunner, RUN_TIMEOUT_MS, type RunResult } from "@/lib/python-runner";
import { useTheme } from "@/lib/theme";
import { useT } from "@/i18n/use-t";
import type { ResolvedChallenge } from "@/content/schema";

export function ChallengeCode({
  trackId,
  challenge,
  runner,
  accent,
}: {
  trackId: string;
  challenge: ResolvedChallenge;
  runner: PythonRunner | null;
  accent: string;
}) {
  const t = useT();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { solvedChallengeIds, refresh } = useProgress();

  const [code, setCode] = useState(challenge.starterCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [saveError, setSaveError] = useState(false);

  const solved = solvedChallengeIds.has(challenge.id);
  const visible = challenge.tests.filter((c) => !c.hidden);
  const hiddenCount = challenge.tests.length - visible.length;

  async function doRun() {
    if (!runner) return;
    setBusy("run");
    setResult(null);
    setSaveError(false);
    try {
      setResult(await runner.run(code));
    } finally {
      setBusy(null);
    }
  }

  async function doSubmit() {
    if (!runner) return;
    setBusy("submit");
    setResult(null);
    setSaveError(false);
    try {
      const graded = await runner.grade(code, challenge.tests);
      setResult(graded);
      const allPassed = graded.cases !== null && graded.cases.every((c) => c.ok);
      if (allPassed && user) {
        try {
          await markChallengeSolved(user.uid, trackId, challenge.id);
          await refresh();
        } catch {
          setSaveError(true);
        }
      }
    } finally {
      setBusy(null);
    }
  }

  async function reopen() {
    if (!user) return;
    setBusy("submit");
    try {
      await unmarkChallengeSolved(user.uid, challenge.id);
      await refresh();
      setResult(null);
    } finally {
      setBusy(null);
    }
  }

  const passedCount = result?.cases?.filter((c) => c.ok).length ?? 0;
  const allPassed = result?.cases != null && passedCount === challenge.tests.length;

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-main">{challenge.prompt}</p>

      {/* worked examples -- the hidden ones are only counted, never shown */}
      {visible.length > 0 && (
        <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-faint">
            {t("challenges.examples")}
          </p>
          <div className="space-y-1 font-mono text-[11px] text-muted">
            {visible.map((c, i) => (
              <div key={i}>
                <span className="text-main">{c.call}</span>
                <span className="text-faint"> → </span>
                <span style={{ color: "var(--cleared)" }}>{c.expected}</span>
              </div>
            ))}
          </div>
          {hiddenCount > 0 && (
            <p className="mt-2 text-[11px] text-faint">
              {t("challenges.hiddenTests").replace("{count}", String(hiddenCount))}
            </p>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
        <CodeMirror
          value={code}
          height="190px"
          theme={theme === "dark" ? oneDark : undefined}
          extensions={[python()]}
          onChange={setCode}
          basicSetup={{ lineNumbers: true, foldGutter: false, autocompletion: false }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={doRun}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold text-main transition disabled:opacity-50"
          style={{ borderColor: "var(--border-strong)" }}
        >
          {busy === "run" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {t("lesson.run")}
        </button>

        <button
          onClick={doSubmit}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wide transition disabled:opacity-50"
          style={{ background: accent, color: "var(--surface-solid)" }}
        >
          {busy === "submit" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {t("challenges.submit")}
        </button>

        {code !== challenge.starterCode && (
          <button
            onClick={() => setCode(challenge.starterCode)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-faint transition hover:opacity-80"
          >
            <RotateCcw className="h-3 w-3" />
            {t("lesson.reset")}
          </button>
        )}

        {solved && (
          <span
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: "var(--cleared)" }}
          >
            <Check className="h-3.5 w-3.5" />
            {t("challenges.solved")}
          </span>
        )}
      </div>

      {/* verdict */}
      {result && (
        <div className="space-y-2">
          {result.loadFailed ? (
            <Banner tone="warn" icon={AlertTriangle}>{t("lesson.pythonFailed")}</Banner>
          ) : result.timedOut ? (
            <Banner tone="warn" icon={AlertTriangle}>
              {t("lesson.tooLong").replace("{seconds}", String(RUN_TIMEOUT_MS / 1000))}
            </Banner>
          ) : result.error ? (
            // The code never got far enough to be graded -- a syntax error or a
            // crash at import time. Show the Python message, not a verdict.
            <Banner tone="warn" icon={AlertTriangle}>
              <span className="font-mono">{result.error}</span>
            </Banner>
          ) : result.cases ? (
            <>
              <Banner tone={allPassed ? "ok" : "warn"} icon={allPassed ? Check : X}>
                {allPassed
                  ? t("challenges.allPassed")
                  : t("challenges.someFailed")
                      .replace("{passed}", String(passedCount))
                      .replace("{total}", String(challenge.tests.length))}
              </Banner>

              {!allPassed && (
                <div className="space-y-1">
                  {result.cases.map((c, i) => {
                    const spec = challenge.tests[i];
                    if (c.ok) return null;
                    return (
                      <div
                        key={i}
                        className="rounded-lg p-2 font-mono text-[11px]"
                        style={{ background: "color-mix(in srgb, var(--reward) 8%, transparent)" }}
                      >
                        {spec.hidden ? (
                          <span style={{ color: "var(--reward)" }}>
                            {t("challenges.hiddenFailed").replace("{n}", String(i + 1))}
                          </span>
                        ) : (
                          <>
                            <span className="text-main">{spec.call}</span>
                            <span className="text-faint"> → {t("challenges.expected")} </span>
                            <span style={{ color: "var(--cleared)" }}>{spec.expected}</span>
                            <span className="text-faint">, {t("challenges.got")} </span>
                            <span style={{ color: "var(--reward)" }}>{c.error ?? c.actual}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {allPassed && challenge.explanation && (
                <p
                  className="rounded-lg p-2.5 text-xs leading-relaxed"
                  style={{
                    background: "color-mix(in srgb, var(--cleared) 8%, transparent)",
                    color: "var(--text-muted)",
                  }}
                >
                  {challenge.explanation}
                </p>
              )}
            </>
          ) : null}

          {result.stdout && (
            <pre
              className="whitespace-pre-wrap rounded-lg p-2.5 font-mono text-[11px] text-main"
              style={{ background: "var(--bg)" }}
            >
              {result.stdout}
            </pre>
          )}

          {saveError && (
            <Banner tone="warn" icon={AlertTriangle}>{t("lesson.markFailed")}</Banner>
          )}
        </div>
      )}

      {solved && (
        <button
          onClick={reopen}
          disabled={busy !== null}
          className="text-[11px] font-bold text-faint underline decoration-2 underline-offset-2 disabled:opacity-50"
        >
          {t("lesson.markUndo")}
        </button>
      )}
    </div>
  );
}

function Banner({
  tone,
  icon: Icon,
  children,
}: {
  tone: "ok" | "warn";
  icon: typeof Check;
  children: React.ReactNode;
}) {
  const color = tone === "ok" ? "var(--cleared)" : "var(--reward)";
  return (
    <p
      className="inline-flex w-full items-start gap-2 rounded-lg p-2.5 text-xs font-bold"
      style={{ background: `color-mix(in srgb, ${color} 10%, transparent)`, color }}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
