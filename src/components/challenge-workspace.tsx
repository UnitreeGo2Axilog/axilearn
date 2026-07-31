"use client";

/**
 * One challenge, on its own, filling the screen: the problem and its tabs on
 * the left, the editor and results on the right.
 *
 * Picking a challenge REPLACES the list rather than expanding inside it. A
 * row that unfolds while five other rows stay on screen is a page you have to
 * navigate; solving a problem deserves the whole surface, with nothing else
 * competing for attention.
 *
 * This is state, not a route, and that is a deliberate trade. A route would
 * give shareable per-problem URLs, but every entry and exit would tear down
 * and re-initialise the 3D background behind it -- a visible flash on a
 * screen the learner moves in and out of constantly. Keeping it in state
 * makes the transition instant and the scene continuous.
 *
 * Three tabs, matching the shape a learner already knows from elsewhere:
 *
 *   Problem    the statement, examples, and the editor
 *   Editorial  the worked solution, behind an explicit unlock
 *   Tutorial   how to approach it, freely readable
 *
 * The editorial is locked because an answer in reach is not a hint -- it ends
 * the exercise. The tutorial is not, because "I don't know where to start" is
 * a different problem from "I want the answer", and only one of them should
 * cost anything.
 */
import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  Send,
  Unlock,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";
import { markChallengeSolved, unlockEditorial, unmarkChallengeSolved } from "@/lib/progress";
import { PythonRunner, RUN_TIMEOUT_MS, type RunResult } from "@/lib/python-runner";
import { Tabs, type TabItem } from "@/components/tabs";
import { useTheme } from "@/lib/theme";
import { useT } from "@/i18n/use-t";
import type { ResolvedChallenge } from "@/content/schema";

type TabId = "problem" | "editorial" | "tutorial";

const DIFF_COLOR: Record<ResolvedChallenge["difficulty"], string> = {
  easy: "var(--cleared)",
  medium: "var(--reward)",
  hard: "var(--advanced)",
};

export function ChallengeWorkspace({
  trackId,
  challenge,
  runner,
  onBack,
}: {
  trackId: string;
  challenge: ResolvedChallenge;
  runner: PythonRunner | null;
  onBack: () => void;
}) {
  const t = useT();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { solvedChallengeIds, editorialUnlockedIds, refresh } = useProgress();

  const [tab, setTab] = useState<TabId>("problem");
  const [code, setCode] = useState(challenge.starterCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [confirmingUnlock, setConfirmingUnlock] = useState(false);

  const accent = DIFF_COLOR[challenge.difficulty];
  const solved = solvedChallengeIds.has(challenge.id);
  const unlocked = editorialUnlockedIds.has(challenge.id);
  const visible = challenge.tests.filter((c) => !c.hidden);
  const hiddenCount = challenge.tests.length - visible.length;

  const passedCount = result?.cases?.filter((c) => c.ok).length ?? 0;
  const allPassed = result?.cases != null && passedCount === challenge.tests.length;

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
      if (graded.cases !== null && graded.cases.every((c) => c.ok) && user) {
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

  async function doUnlock() {
    if (!user) return;
    try {
      await unlockEditorial(user.uid, trackId, challenge.id);
      await refresh();
    } catch {
      setSaveError(true);
    }
    setConfirmingUnlock(false);
  }

  const tabs: TabItem<TabId>[] = [
    { id: "problem", label: t("challenges.tabProblem") },
    {
      id: "editorial",
      label: t("challenges.tabEditorial"),
      icon: unlocked ? undefined : <Lock className="h-3 w-3" />,
    },
    { id: "tutorial", label: t("challenges.tabTutorial") },
  ];

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("challenges.backToList")}
        </button>
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
          style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}
        >
          {t(`challenges.${challenge.difficulty}` as const)}
        </span>
        <h1 className="min-w-0 flex-1 truncate text-lg font-extrabold text-strong">
          {challenge.title}
        </h1>
        {solved && (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: "var(--cleared)" }}
          >
            <Check className="h-4 w-4" />
            {t("challenges.solved")}
          </span>
        )}
      </div>

      {/* two columns on a real screen: statement left, workbench right */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="panel rounded-2xl">
          <div className="px-2 pt-1">
            <Tabs tabs={tabs} active={tab} onChange={setTab} accent={accent} />
          </div>

          <div className="max-h-[60vh] space-y-3 overflow-auto p-4">
            {tab === "problem" && (
              <>
                <p className="whitespace-pre-line text-sm leading-relaxed text-main">
                  {challenge.prompt}
                </p>

                {visible.length > 0 && (
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-faint">
                      {t("challenges.examples")}
                    </p>
                    <div className="space-y-1 font-mono text-[11px]">
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
              </>
            )}

            {tab === "editorial" &&
              (unlocked ? (
                challenge.editorial ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-main">
                    {challenge.editorial}
                  </p>
                ) : (
                  <p className="text-sm text-muted">{t("challenges.noEditorial")}</p>
                )
              ) : (
                <div className="grid place-items-center gap-3 py-8 text-center">
                  <span
                    className="grid h-14 w-14 place-items-center rounded-2xl"
                    style={{ background: "var(--bg-2)", color: "var(--text-faint)" }}
                  >
                    <Lock className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-bold text-strong">{t("challenges.editorialLocked")}</p>
                  <p className="max-w-sm text-xs leading-relaxed text-muted">
                    {t("challenges.editorialWarning")}
                  </p>
                  {confirmingUnlock ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={doUnlock}
                        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black"
                        style={{ background: "var(--reward)", color: "var(--surface-solid)" }}
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        {t("challenges.editorialConfirm")}
                      </button>
                      <button
                        onClick={() => setConfirmingUnlock(false)}
                        className="rounded-xl px-3 py-2 text-xs font-bold text-muted"
                      >
                        {t("lesson.notNow")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingUnlock(true)}
                      disabled={!challenge.editorial}
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black disabled:opacity-40"
                      style={{ background: "var(--reward)", color: "var(--surface-solid)" }}
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      {t("challenges.editorialUnlock")}
                    </button>
                  )}
                </div>
              ))}

            {tab === "tutorial" &&
              (challenge.tutorial ? (
                <div className="space-y-2">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-faint">
                    <BookOpen className="h-3.5 w-3.5" />
                    {t("challenges.tutorialFree")}
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-main">
                    {challenge.tutorial}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted">{t("challenges.noTutorial")}</p>
              ))}
          </div>
        </section>

        {/* workbench */}
        <section className="panel panel-glow flex flex-col rounded-2xl p-4">
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <CodeMirror
              value={code}
              height="320px"
              theme={theme === "dark" ? oneDark : undefined}
              extensions={[python()]}
              onChange={setCode}
              basicSetup={{ lineNumbers: true, foldGutter: false, autocompletion: false }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
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
              <button
                onClick={async () => {
                  if (!user) return;
                  await unmarkChallengeSolved(user.uid, challenge.id);
                  await refresh();
                  setResult(null);
                }}
                className="ml-auto text-[11px] font-bold text-faint underline decoration-2 underline-offset-2"
              >
                {t("lesson.markUndo")}
              </button>
            )}
          </div>

          <div className="mt-3 min-h-[120px] space-y-2 overflow-auto">
            {!result ? (
              <p className="text-xs text-faint">{t("challenges.runHint")}</p>
            ) : result.loadFailed ? (
              <Banner tone="warn">{t("lesson.pythonFailed")}</Banner>
            ) : result.timedOut ? (
              <Banner tone="warn">
                {t("lesson.tooLong").replace("{seconds}", String(RUN_TIMEOUT_MS / 1000))}
              </Banner>
            ) : result.error ? (
              <Banner tone="warn">
                <span className="font-mono">{result.error}</span>
              </Banner>
            ) : result.cases ? (
              <>
                <Banner tone={allPassed ? "ok" : "warn"}>
                  {allPassed
                    ? t("challenges.allPassed")
                    : t("challenges.someFailed")
                        .replace("{passed}", String(passedCount))
                        .replace("{total}", String(challenge.tests.length))}
                </Banner>
                {!allPassed &&
                  result.cases.map((c, i) => {
                    if (c.ok) return null;
                    const spec = challenge.tests[i];
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

            {result?.stdout && (
              <pre
                className="whitespace-pre-wrap rounded-lg p-2.5 font-mono text-[11px] text-main"
                style={{ background: "var(--bg)" }}
              >
                {result.stdout}
              </pre>
            )}
            {saveError && <Banner tone="warn">{t("lesson.markFailed")}</Banner>}
          </div>
        </section>
      </div>
    </div>
  );
}

function Banner({ tone, children }: { tone: "ok" | "warn"; children: React.ReactNode }) {
  const color = tone === "ok" ? "var(--cleared)" : "var(--reward)";
  const Icon = tone === "ok" ? Check : tone === "warn" ? AlertTriangle : X;
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
