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
 * Segments you have reached are links -- the Previous button walks one step,
 * the bar jumps to any of them. Ones you have not are not, and that matters:
 * gating the Next button while leaving these open would have made the gate
 * decorative, since clicking two segments ahead goes exactly where Next
 * refuses to. Same rule as the map, from the same function.
 */
import Link from "next/link";
import type { Level } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { lessonStates } from "@/lib/lesson-access";
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
  const states = lessonStates(levels, completedIds);

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
          const locked = states.get(l.id) === "locked" && !here;
          const fill =
            done || here ? accent : "color-mix(in srgb, var(--text) 14%, transparent)";
          const shape = "h-1.5 flex-1 rounded-full transition";
          const paint = {
            // The step you are on is solid even unfinished -- being here is a
            // different fact from having done it.
            background: fill,
            boxShadow: here ? `0 0 8px ${accent}` : "none",
          };

          return (
            <Tooltip
              key={l.id}
              label={locked ? `${i + 1}. ${t("lesson.stepLocked")}` : `${i + 1}. ${l.title}`}
            >
              {locked ? (
                // Not a link, and not titled: naming a lesson you have not
                // reached is a small spoiler, and the map does not name them
                // either.
                <span aria-label={`${i + 1}. ${t("lesson.stepLocked")}`} className={shape} style={paint} />
              ) : (
                <Link
                  href={`/${locale}/lesson/${l.id}`}
                  aria-label={`${i + 1}. ${l.title}`}
                  aria-current={here ? "step" : undefined}
                  className={shape}
                  style={paint}
                />
              )}
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
