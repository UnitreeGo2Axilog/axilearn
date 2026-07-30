"use client";

/**
 * One challenge: collapsed to a title, difficulty pill, XP and a solved
 * badge; expands into the same answer-and-reveal interaction as a lesson
 * quiz question, via the shared QuizOptions.
 *
 * Unlike a lesson's quiz, solving a challenge gates nothing else -- it is
 * optional practice, so there is no "must pass to continue" pressure, just a
 * clean record of what has been solved.
 */
import { useState } from "react";
import { Check, ChevronDown, Loader2, RotateCcw, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";
import { markChallengeSolved, unmarkChallengeSolved } from "@/lib/progress";
import { QuizOptions } from "@/components/quiz-options";
import { useT } from "@/i18n/use-t";
import type { ResolvedChallenge } from "@/content/schema";

const DIFF_COLOR: Record<ResolvedChallenge["difficulty"], string> = {
  easy: "var(--cleared)",
  medium: "var(--reward)",
  hard: "var(--advanced)",
};

export function ChallengeCard({
  trackId,
  challenge,
}: {
  trackId: string;
  challenge: ResolvedChallenge;
}) {
  const t = useT();
  const { user } = useAuth();
  const { solvedChallengeIds, refresh } = useProgress();
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  const solved = solvedChallengeIds.has(challenge.id);
  const diffColor = DIFF_COLOR[challenge.difficulty];

  async function check() {
    if (chosen === null || !user) return;
    setChecked(true);
    if (chosen === challenge.correctIndex) {
      setBusy(true);
      try {
        await markChallengeSolved(user.uid, trackId, challenge.id, challenge.xpReward);
        await refresh();
      } finally {
        setBusy(false);
      }
    }
  }

  function retry() {
    setChosen(null);
    setChecked(false);
  }

  async function resetSolved() {
    if (!user) return;
    setBusy(true);
    try {
      await unmarkChallengeSolved(user.uid, challenge.id);
      await refresh();
      retry();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel overflow-hidden rounded-xl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 p-3.5 text-left"
      >
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
          style={{
            background: solved
              ? "color-mix(in srgb, var(--cleared) 18%, transparent)"
              : "var(--bg-2)",
            color: solved ? "var(--cleared)" : "var(--text-faint)",
          }}
        >
          {solved ? <Check className="h-4 w-4" strokeWidth={3} /> : <Zap className="h-4 w-4" />}
        </span>
        <span className="min-w-[140px] flex-1 text-sm font-bold text-main">{challenge.title}</span>
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
          style={{ background: "color-mix(in srgb, var(--reward) 14%, transparent)", color: "var(--reward)" }}
        >
          +{challenge.xpReward} XP
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-faint)" }}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t p-4" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm leading-relaxed text-main">{challenge.prompt}</p>

          <QuizOptions
            options={challenge.options}
            correctIndex={challenge.correctIndex}
            chosen={chosen}
            checked={checked || solved}
            accent={diffColor}
            onPick={setChosen}
          />

          {(checked || solved) && challenge.explanation && (
            <p
              className="rounded-lg p-2.5 text-xs leading-relaxed"
              style={{ background: "var(--bg-2)", color: "var(--text-muted)" }}
            >
              {challenge.explanation}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {solved ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--cleared)" }}>
                  <Check className="h-3.5 w-3.5" />
                  {t("challenges.solved")}
                </span>
                <button
                  onClick={resetSolved}
                  disabled={busy}
                  className="ml-auto text-xs font-bold text-faint underline decoration-2 underline-offset-2 disabled:opacity-50"
                >
                  {t("lesson.markUndo")}
                </button>
              </>
            ) : !checked ? (
              <button
                onClick={check}
                disabled={chosen === null}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wide disabled:opacity-40"
                style={{ background: diffColor, color: "var(--surface-solid)" }}
              >
                {t("quiz.check")}
              </button>
            ) : busy ? (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-faint">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t("admin.saving")}
              </span>
            ) : chosen === challenge.correctIndex ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--cleared)" }}>
                <Check className="h-3.5 w-3.5" />
                {t("quiz.passed")}
              </span>
            ) : (
              <button
                onClick={retry}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wide"
                style={{ background: diffColor, color: "var(--surface-solid)" }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("quiz.retry")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
