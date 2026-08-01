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
 *
 * "Lesson 3 of 9" opens a table of contents. The bar alone shows shape but
 * not substance -- it can say four lessons, two done, without naming one of
 * them, and a tooltip only names whichever segment the pointer happens to be
 * over. The list names them all at once, which is the difference between
 * knowing where you are and knowing what is coming.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Lock, Play } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on a click anywhere else, and on Escape. Both are what people
  // already expect from a menu, and without them the only way out is to pick
  // something -- which turns a peek at the contents into a navigation.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="truncate text-xs font-bold text-muted">{trackTitle}</span>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label={t("lesson.contents")}
            className="inline-flex items-center gap-1 text-xs font-bold transition hover:opacity-80"
            style={{ color: accent }}
          >
            {t("lesson.stepOf")
              .replace("{n}", String(index + 1))
              .replace("{total}", String(levels.length))}
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform"
              style={{ transform: open ? "rotate(180deg)" : "none" }}
            />
          </button>

          {open && (
            <div
              role="menu"
              aria-label={t("lesson.contents")}
              className="absolute right-0 z-30 mt-2 max-h-[60vh] w-72 overflow-y-auto rounded-xl border p-1.5 shadow-xl"
              style={{
                borderColor: "var(--border-strong)",
                background: "var(--surface-solid)",
              }}
            >
              {levels.map((l, i) => {
                const state = i === index ? "here" : states.get(l.id);
                const reachable = state !== "locked";
                const Icon = state === "completed" ? Check : reachable ? Play : Lock;
                const tone =
                  state === "completed"
                    ? "var(--cleared)"
                    : state === "here"
                      ? accent
                      : "var(--text-faint)";

                const row = (
                  <>
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-md"
                      style={{
                        background: `color-mix(in srgb, ${tone} 16%, transparent)`,
                        color: tone,
                      }}
                    >
                      <Icon className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {/* A lesson you have not reached keeps its name to
                          itself, exactly as it does on the map. */}
                      {reachable ? `${i + 1}. ${l.title}` : `${i + 1}. ${t("lesson.stepLocked")}`}
                    </span>
                  </>
                );

                const shared =
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-semibold";

                return reachable ? (
                  <Link
                    key={l.id}
                    href={`/${locale}/lesson/${l.id}`}
                    role="menuitem"
                    aria-current={i === index ? "step" : undefined}
                    onClick={() => setOpen(false)}
                    className={`${shared} transition hover:opacity-80`}
                    style={{
                      background:
                        i === index ? `color-mix(in srgb, ${accent} 12%, transparent)` : "transparent",
                      color: i === index ? "var(--text-strong)" : "var(--text-main)",
                    }}
                  >
                    {row}
                  </Link>
                ) : (
                  <span key={l.id} className={`${shared} text-faint`}>
                    {row}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1">
        {levels.map((l, i) => {
          const done = completedIds.has(l.id);
          const here = i === index;
          const locked = states.get(l.id) === "locked" && !here;
          const fill =
            done || here ? accent : "color-mix(in srgb, var(--text) 14%, transparent)";
          // Width comes from the Tooltip wrapper, which is the real flex item
          // here; the segment simply fills it. Putting flex-1 on the segment
          // instead sizes it against a wrapper that has no width of its own,
          // and the whole bar collapses to nothing.
          const shape = "block h-1.5 w-full rounded-full transition";
          const paint = {
            // The step you are on is solid even unfinished -- being here is a
            // different fact from having done it.
            background: fill,
            boxShadow: here ? `0 0 8px ${accent}` : "none",
          };

          return (
            <Tooltip
              key={l.id}
              className="flex-1"
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
