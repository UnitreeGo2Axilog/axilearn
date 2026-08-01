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
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import type { Level } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { useT } from "@/i18n/use-t";

export function LessonNav({
  lessonId,
  prev,
  next,
  locale,
  accent,
}: {
  lessonId: string;
  prev: Level | null;
  next: Level | null;
  locale: string;
  accent: string;
}) {
  const t = useT();
  const { completedIds } = useProgress();
  const done = completedIds.has(lessonId);

  if (!prev && !next) return null;

  return (
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
  );
}
