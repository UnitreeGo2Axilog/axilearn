"use client";

/**
 * The QCM (multiple-choice quiz) that gates a lesson's completion.
 *
 * Before this existed, "mark as done" was a single unguarded button -- a
 * learner could complete a lesson without reading a word of it, and every
 * progress number on the platform (map, profile, admin roster) would have
 * reported that as real learning. So the quiz still stands between a lesson
 * and its XP.
 *
 * It no longer stands between a lesson and the REST OF THE TRACK. It did:
 * completion was awarded only on a perfect score, and the next lesson unlocks
 * on completion, so a single stubborn question walled a learner out of
 * everything after it -- a comprehension check behaving like an exam. A
 * perfect score still awards the lesson instantly. Anything short of it now
 * offers both a retry and the choice to mark the lesson done and carry on.
 *
 * All questions show at once, like a real answer sheet. Checking reveals
 * right/wrong PLUS an explanation for each one -- right or wrong, because the
 * explanation is the teaching moment rather than the verdict, and it is what
 * makes moving on after a wrong answer different from skipping.
 */
import { useMemo, useState } from "react";
import { Check, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";
import { markLessonDone, unmarkLessonDone } from "@/lib/progress";
import { useT } from "@/i18n/use-t";
import { QuizOptions } from "@/components/quiz-options";
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

  /** Complete the lesson. Reached automatically on a perfect score, or by
   *  the learner's own choice after seeing where they went wrong. */
  async function award() {
    setBusy(true);
    setFailed(false);
    try {
      await markLessonDone(uid, trackId, lessonId, xp);
      await refresh();
    } catch {
      // Surfaced below: without this a failed write showed "done" anyway,
      // and the next lesson would stay locked with nothing explaining why.
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function check() {
    setChecked(true);
    if (answers.every((a, i) => a === quiz[i].correctIndex)) await award();
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
            {/* Only celebrate a clean sweep. Someone who moved on with two
                wrong answers being told "Nailed it!" learns that the
                platform is not paying attention. */}
            {passed ? t("quiz.passed") : t("quiz.doneTitle")}
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
            <QuizOptions
              options={q.options}
              correctIndex={q.correctIndex}
              chosen={chosen}
              checked={checked}
              accent={accent}
              onPick={(oi) => pick(qi, oi)}
            />

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
        {busy ? (
          <span className="inline-flex items-center gap-2 text-sm font-bold text-faint">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("admin.saving")}
          </span>
        ) : !checked ? (
          <button
            onClick={check}
            disabled={!allAnswered}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black uppercase tracking-wide transition disabled:opacity-40"
            style={{ background: accent, color: "var(--surface-solid)" }}
          >
            <Check className="h-4 w-4" />
            {t("quiz.check")}
          </button>
        ) : passed ? (
          <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--cleared)" }}>
            <Check className="h-4 w-4" />
            {t("quiz.passed")} · +{xp} XP
          </span>
        ) : (
          // Got some wrong. Two ways forward, and neither is a dead end:
          // try again for the full score, or accept it and keep going. The
          // second one is why one hard question can no longer wall a learner
          // out of every lesson that follows.
          <>
            <button
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-black uppercase tracking-wide transition hover:opacity-80"
              style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
            >
              <RotateCcw className="h-4 w-4" />
              {t("quiz.retry")}
            </button>
            <button
              onClick={award}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black uppercase tracking-wide transition"
              style={{ background: accent, color: "var(--surface-solid)" }}
            >
              <Check className="h-4 w-4" />
              {t("quiz.markAnyway")}
            </button>
          </>
        )}

        {checked && !passed && !busy && (
          <span className="text-xs font-bold text-faint">
            {t("quiz.scoreLabel").replace("{score}", String(score)).replace("{total}", String(quiz.length))}
          </span>
        )}
        {checked && !passed && !busy && (
          <span className="w-full text-xs leading-relaxed text-faint">{t("quiz.reviewHint")}</span>
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
