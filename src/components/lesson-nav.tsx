"use client";

/**
 * Moving between lessons, in both directions, with the forward one earned.
 *
 * BACK is always open. Re-reading the lesson before this one is never
 * something to make anybody prove they deserve, and it is the whole reason
 * this control exists.
 *
 * FORWARD waits until this lesson is marked done. The map already worked
 * this way -- finished lessons are cleared, the first unfinished one is open,
 * the rest are locked buttons -- but the lesson page handed out a Next link
 * regardless, so the sequence the map enforced could be walked straight past
 * by pressing Next four times.
 *
 * The locked state is shown rather than hidden. An empty space where a button
 * belongs reads as a page that is broken or a track that has ended; a lock
 * with a sentence next to it says there IS more, and what to do about it.
 */
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, PartyPopper } from "lucide-react";
import type { Level } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { useT } from "@/i18n/use-t";

export function LessonNav({
  lessonId,
  prev,
  next,
  locale,
  accent,
  trackId,
  examId,
}: {
  lessonId: string;
  prev: Level | null;
  next: Level | null;
  locale: string;
  accent: string;
  trackId: string;
  /** The track's final exam, when it has one. */
  examId?: string;
}) {
  const t = useT();
  const { completedIds } = useProgress();
  const done = completedIds.has(lessonId);

  // The end of the track. Without this the last chapter simply stops -- a
  // Previous button and nothing else, which reads as the page having failed
  // rather than the course having been finished.
  const finished = !next && done;

  if (!prev && !next) return null;

  return (
    <>
      {finished && (
        <div
          className="mt-6 rounded-2xl border p-5 text-center"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
            background: `color-mix(in srgb, ${accent} 8%, transparent)`,
          }}
        >
          <PartyPopper className="mx-auto h-7 w-7" style={{ color: accent }} />
          <p className="mt-2 text-lg font-extrabold text-strong">{t("lesson.trackDone")}</p>
          <p className="mx-auto mt-1 max-w-lg text-sm leading-relaxed text-muted">
            {examId ? t("lesson.trackDoneBody") : t("cert.available")}
          </p>
          <Link
            href={
              examId
                ? `/${locale}/challenges/${trackId}?start=${examId}`
                : `/${locale}/certificate/${trackId}`
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black"
            style={{ background: accent, color: "var(--surface-solid)" }}
          >
            {examId ? t("lesson.goToExam") : t("cert.view")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      {prev ? (
        <Link
          href={`/${locale}/lesson/${prev.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-bold text-main transition hover:opacity-80"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("lesson.prev")}
        </Link>
      ) : (
        // Holds the row's shape so Next does not slide left on lesson one.
        <span />
      )}

      {next &&
        (done ? (
          <Link
            href={`/${locale}/lesson/${next.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-black"
            style={{ background: accent, color: "var(--surface-solid)" }}
          >
            {t("lesson.next")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-bold text-faint"
            style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
          >
            <Lock className="h-3.5 w-3.5" />
            {t("lesson.nextLocked")}
          </span>
        ))}
    </div>
    </>
  );
}
