"use client";

/**
 * The button that turns a lesson into progress.
 *
 * Until this existed, every completion on the platform was hard-coded demo
 * data: the maps showed three lessons cleared for everyone and a teacher had
 * nothing to look at. This is the one write that makes the mission map, the
 * profile and the admin roster describe the same real learner.
 *
 * Undo is deliberate. Someone who clicks it by accident on a lesson they have
 * not read should be able to take it back without asking a teacher.
 */
import { useState } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";
import { markLessonDone, unmarkLessonDone } from "@/lib/progress";
import { useT } from "@/i18n/use-t";

export function LessonComplete({
  trackId,
  lessonId,
  xp,
  accent,
}: {
  trackId: string;
  lessonId: string;
  xp: number;
  accent: string;
}) {
  const t = useT();
  const { user } = useAuth();
  const { completedIds, refresh, loading } = useProgress();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!user) return null;

  const done = completedIds.has(lessonId);

  async function toggle() {
    setBusy(true);
    setFailed(false);
    try {
      if (done) await unmarkLessonDone(user!.uid, lessonId);
      else await markLessonDone(user!.uid, trackId, lessonId, xp);
      await refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={toggle}
        disabled={busy || loading}
        className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black uppercase tracking-wide transition disabled:opacity-50"
        style={
          done
            ? {
                background: "color-mix(in srgb, var(--cleared) 16%, transparent)",
                border: "1px solid color-mix(in srgb, var(--cleared) 50%, transparent)",
                color: "var(--cleared)",
              }
            : { background: accent, color: "var(--surface-solid)" }
        }
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : done ? (
          <RotateCcw className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {done ? t("lesson.markUndo") : t("lesson.markDone")}
      </button>

      {done && !busy && (
        <span className="text-xs font-bold" style={{ color: "var(--cleared)" }}>
          +{xp} XP · {t("lesson.completed")}
        </span>
      )}
      {failed && (
        <span className="text-xs font-bold" style={{ color: "var(--reward)" }}>
          {t("lesson.markFailed")}
        </span>
      )}
    </div>
  );
}
