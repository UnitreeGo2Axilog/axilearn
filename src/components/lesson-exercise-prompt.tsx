"use client";

/**
 * The nudge that appears once a learner reaches the foot of a lesson: a small
 * card offering the track's coding challenges, with "Not now" and "Start
 * Exercise".
 *
 * Timing is the whole point. It is triggered by an invisible sentinel at the
 * bottom of the lesson scrolling into view, not by a timer and not on load --
 * so it arrives exactly when someone has finished reading and is looking for
 * what to do next, rather than interrupting them mid-paragraph.
 *
 * "Not now" is remembered for that lesson for the rest of the session. A
 * dismissal that reappears on the next scroll is not a dismissal, it is
 * nagging -- and sessionStorage (not localStorage) is the right scope: saying
 * "not now" today should not silently hide the prompt forever.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Code2, X } from "lucide-react";
import { useLocale, useT } from "@/i18n/use-t";

export function LessonExercisePrompt({
  trackId,
  trackTitle,
  accent,
  lessonId,
  startId,
}: {
  trackId: string;
  trackTitle: string;
  accent: string;
  lessonId: string;
  /** The easy challenge for THIS lesson, when the track has one. */
  startId?: string;
}) {
  const t = useT();
  const locale = useLocale();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [reached, setReached] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume hidden until we can check

  const key = `axilearn-exercise-prompt-${lessonId}`;

  useEffect(() => {
    // Read the dismissal in an effect, never during render: sessionStorage is
    // browser-only, and touching it while rendering would break the server
    // pass and hydration.
    try {
      setDismissed(sessionStorage.getItem(key) === "1");
    } catch {
      setDismissed(false);
    }
  }, [key]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setReached(true);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      // Private browsing can refuse storage; dismissing for this view is
      // still better than leaving the card stuck on screen.
    }
  }

  return (
    <>
      {/* the trigger: an empty marker at the very bottom of the lesson */}
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      {reached && !dismissed && (
        <div
          role="complementary"
          className="animate-pop fixed bottom-4 left-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border p-4 shadow-lg"
          style={{
            borderColor: `${accent}55`,
            background: "color-mix(in srgb, var(--surface-solid) 92%, transparent)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <button
            onClick={dismiss}
            aria-label={t("lesson.notNow")}
            className="absolute right-2 top-2 rounded-md p-1 text-faint transition hover:opacity-70"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-start gap-3">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
              style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}
            >
              <Code2 className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-extrabold text-strong">{t("lesson.yourTurn")}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">
                {t("lesson.yourTurnBody").replace("{track}", trackTitle)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={dismiss}
              className="rounded-lg px-3 py-2 text-xs font-bold text-muted transition hover:opacity-80"
            >
              {t("lesson.notNow")}
            </button>
            <Link
              href={
                startId
                  ? `/${locale}/challenges/${trackId}?start=${startId}`
                  : `/${locale}/challenges/${trackId}`
              }
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black"
              style={{ background: accent, color: "var(--surface-solid)" }}
            >
              {t("lesson.startExercise")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
