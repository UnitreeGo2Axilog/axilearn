"use client";

/**
 * Where you are in the track, at the top of every lesson.
 *
 * One segment per lesson, so the bar answers three questions at a glance that
 * a percentage cannot: how far along am I, how much is left, and which of
 * these have I actually finished. A plain "40%" tells you none of that, and
 * for a track of four lessons it is worse than the segments it replaces.
 *
 * Client-rendered because completion is per-learner. The count and the
 * position come from the server; only the filled/empty state of each segment
 * needs the learner's own progress.
 *
 * Every segment is a link. That is the cheap half of the "let me go back"
 * problem -- the Previous button walks one step, this jumps anywhere -- and
 * it costs nothing, because a lesson URL was never gated in the first place.
 */
import Link from "next/link";
import type { Level } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { Tooltip } from "@/components/tooltip";
import { useT } from "@/i18n/use-t";

export function LessonSteps({
  levels,
  index,
  locale,
  accent,
  trackTitle,
}: {
  levels: Level[];
  index: number;
  locale: string;
  accent: string;
  trackTitle: string;
}) {
  const t = useT();
  const { completedIds } = useProgress();

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="truncate text-xs font-bold text-muted">{trackTitle}</span>
        <span className="shrink-0 text-xs font-bold" style={{ color: accent }}>
          {t("lesson.stepOf").replace("{n}", String(index + 1)).replace("{total}", String(levels.length))}
        </span>
      </div>

      <div className="flex gap-1">
        {levels.map((l, i) => {
          const done = completedIds.has(l.id);
          const here = i === index;
          return (
            <Tooltip key={l.id} label={`${i + 1}. ${l.title}`}>
              <Link
                href={`/${locale}/lesson/${l.id}`}
                aria-label={`${i + 1}. ${l.title}`}
                aria-current={here ? "step" : undefined}
                className="h-1.5 flex-1 rounded-full transition"
                style={{
                  // The current step is solid even when unfinished -- you are
                  // here, which is a different fact from having done it.
                  background: done || here ? accent : "color-mix(in srgb, var(--text) 14%, transparent)",
                  opacity: done || here ? 1 : 0.9,
                  boxShadow: here ? `0 0 8px ${accent}` : "none",
                }}
              />
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
