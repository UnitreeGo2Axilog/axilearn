"use client";

/**
 * The QCM (multiple-choice quiz) that gates a lesson's completion.
 *
 * Before this existed, "mark as done" was a single unguarded button -- a
 * learner could complete a lesson without reading a word of it, and every
 * progress number on the platform (map, profile, admin roster) would have
 * reported that as real learning. Now completion, and the XP that comes with
 * it, is only awarded once every question is answered correctly.
 *
 * All questions show at once, like a real answer sheet. Checking reveals
 * right/wrong PLUS an explanation for each one -- right or wrong, because the
 * explanation is the actual teaching moment, not just a verdict. Getting
 * everything right immediately awards the lesson; anything wrong offers a
 * retry with a clean slate, because this is a comprehension check meant to
 * be passed, not a one-shot exam.
 */
import { useMemo, useState } from "react";
import { Check, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";
import { markLessonDone, unmarkLessonDone } from "@/lib/progress";
import { useT } from "@/i18n/use-t";
import type { ResolvedQuiz } from "@/content/schema";

export function LessonQuiz({
  trackId,
  lessonId,
  quiz,
  xp,
  accent,
}: {
  trackId: string;
  lessonId: string;
  quiz: ResolvedQuiz;
  xp: number;
  accent: string;
}) {
  const t = useT();
  const { user } = useAuth();
  const { completedIds, refresh } = useProgress();
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.map(() => null));
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  /** Lets someone review a passed quiz without re-triggering the award flow. */
  const [reviewing, setReviewing] = useState(false);

  const done = completedIds.has(lessonId);
  const allAnswered = answers.every((a) => a !== null);
  const score = useMemo(
    () => answers.filter((a, i) => a === quiz[i].correctIndex).length,
    [answers, quiz],
  );
  const passed = checked && score === quiz.length;

  if (!user) return null;
  const uid = user.uid; // narrowed here; closures below can't see the guard above

  function pick(qi: number, oi: number) {
    if (checked) return; // locked once graded -- retry resets properly instead
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)));
  }

  async function check() {
    setChecked(true);
    if (answers.every((a, i) => a === quiz[i].correctIndex)) {
      setBusy(true);
      setFailed(false);
      try {
        await markLessonDone(uid, trackId, lessonId, xp);
        await refresh();
      } catch {
        setFailed(true);
      } finally {
        setBusy(false);
      }
    }
  }

  function retry() {
    setAnswers(quiz.map(() => null));
    setChecked(false);
  }

  async function resetCompletion() {
    setBusy(true);
    try {
      await unmarkLessonDone(uid, lessonId);
      await refresh();
      retry();
      setReviewing(false);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  // Already passed, and not explicitly reviewing: show the compact "done"
  // summary instead of the full quiz -- nobody should have to re-answer three
  // questions just to keep reading past a lesson they already cleared.
  if (done && !reviewing) {
    return (
      <div
        className="flex flex-wrap items-center gap-3 rounded-2xl border p-4"
        style={{
          borderColor: "color-mix(in srgb, var(--cleared) 40%, transparent)",
          background: "color-mix(in srgb, var(--cleared) 8%, transparent)",
        }}
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ background: "color-mix(in srgb, var(--cleared) 20%, transparent)", color: "var(--cleared)" }}
        >
          <Check className="h-5 w-5" strokeWidth={3} />
        </span>
        <span className="min-w-[160px] flex-1">
          <span className="block text-sm font-bold" style={{ color: "var(--cleared)" }}>
            {t("quiz.passed")}
          </span>
          <span className="block text-xs text-faint">
            +{xp} XP · {t("lesson.completed")}
          </span>
        </span>
        <button
          onClick={() => setReviewing(true)}
          className="text-xs font-bold text-faint underline decoration-2 underline-offset-2 transition hover:opacity-80"
        >
          {t("quiz.retake")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" style={{ color: accent }} />
        <h2 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: accent }}>
          {t("quiz.title")}
        </h2>
      </div>

      {quiz.map((q, qi) => {
        const chosen = answers[qi];
        const isRight = checked && chosen === q.correctIndex;

        return (
          <div key={qi} className="panel rounded-xl p-4">
            <p className="mb-3 text-sm font-bold text-strong">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = chosen === oi;
                const revealCorrect = checked && oi === q.correctIndex;
                const revealWrong = checked && selected && oi !== q.correctIndex;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => pick(qi, oi)}
                    disabled={checked}
                    className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition disabled:cursor-default"
                    style={{
                      borderColor: revealCorrect
                        ? "color-mix(in srgb, var(--cleared) 60%, transparent)"
                        : revealWrong
                          ? "color-mix(in srgb, var(--reward) 60%, transparent)"
                          : selected
                            ? `${accent}88`
                            : "var(--border)",
                      background: revealCorrect
                        ? "color-mix(in srgb, var(--cleared) 12%, transparent)"
                        : revealWrong
                          ? "color-mix(in srgb, var(--reward) 12%, transparent)"
                          : selected
                            ? `color-mix(in srgb, ${accent} 12%, transparent)`
                            : "var(--bg-2)",
                      color: revealCorrect
                        ? "var(--cleared)"
                        : revealWrong
                          ? "var(--reward)"
                          : "var(--text)",
                    }}
                  >
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-black"
                      style={{
                        borderColor: "currentColor",
                        background: selected ? "currentColor" : "transparent",
                        color: "inherit",
                      }}
                    >
                      {revealCorrect ? (
                        <Check className="h-3 w-3" style={{ color: "var(--surface-solid)" }} strokeWidth={3.5} />
                      ) : revealWrong ? (
                        <X className="h-3 w-3" style={{ color: "var(--surface-solid)" }} strokeWidth={3.5} />
                      ) : (
                        String.fromCharCode(65 + oi)
                      )}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {checked && q.explanation && (
              <p
                className="mt-3 rounded-lg p-2.5 text-xs leading-relaxed"
                style={{
                  background: isRight
                    ? "color-mix(in srgb, var(--cleared) 8%, transparent)"
                    : "color-mix(in srgb, var(--reward) 8%, transparent)",
                  color: "var(--text-muted)",
                }}
              >
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        {!checked || !passed ? (
          <button
            onClick={checked ? retry : check}
            disabled={!checked && !allAnswered}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black uppercase tracking-wide transition disabled:opacity-40"
            style={{ background: accent, color: "var(--surface-solid)" }}
          >
            {checked ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            {checked ? t("quiz.retry") : t("quiz.check")}
          </button>
        ) : busy ? (
          <span className="inline-flex items-center gap-2 text-sm font-bold text-faint">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("admin.saving")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--cleared)" }}>
            <Check className="h-4 w-4" />
            {t("quiz.passed")} · +{xp} XP
          </span>
        )}

        {checked && !passed && (
          <span className="text-xs font-bold text-faint">
            {t("quiz.scoreLabel").replace("{score}", String(score)).replace("{total}", String(quiz.length))}
          </span>
        )}
        {!checked && !allAnswered && (
          <span className="text-xs text-faint">{t("quiz.needAllCorrect")}</span>
        )}
        {reviewing && (
          <button
            onClick={resetCompletion}
            className="ml-auto text-xs font-bold text-faint underline decoration-2 underline-offset-2"
          >
            {t("lesson.markUndo")}
          </button>
        )}
        {failed && (
          <span className="text-xs font-bold" style={{ color: "var(--reward)" }}>
            {t("lesson.markFailed")}
          </span>
        )}
      </div>
    </div>
  );
}
