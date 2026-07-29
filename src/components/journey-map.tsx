"use client";

/**
 * The journey map: lessons as numbered nodes along a winding road, the feel of
 * the Kalimat Crash level map the supervisor pointed at.
 *
 * Design notes:
 *  - Positions come from each lesson's `mapPosition` (percentages), so content
 *    controls the layout -- no hard-coded coordinates here.
 *  - The road is one SVG path drawn THROUGH those points with a smooth curve,
 *    so adding a lesson bends the road automatically.
 *  - Nodes are coloured by module (the chapter colours), grey when locked.
 *  - A chest marks the end of each module; the learner's avatar sits on the
 *    current lesson.
 *  - Everything scales with the container, so it works on a phone (tall,
 *    scrollable) and on a laptop.
 */
import Link from "next/link";
import { Check, Gift, Lock } from "lucide-react";
import type { Lesson, Locale, Module } from "@/content/types";
import { t as pick } from "@/content/types";
import { useT } from "@/i18n/use-t";

interface Props {
  lessons: Lesson[];
  modules: Module[];
  locale: Locale;
  completed: string[];
  currentLessonId: string | null;
}

/** Smooth road through the node centres (Catmull-Rom converted to bezier). */
function roadPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

export function JourneyMap({
  lessons,
  modules,
  locale,
  completed,
  currentLessonId,
}: Props) {
  const t = useT();
  const ordered = [...lessons].sort((a, b) => a.order - b.order);
  const colorOf = (moduleId: string) =>
    modules.find((m) => m.id === moduleId)?.color ?? "#64748b";

  // Bottom-to-top: the first lesson sits low, the last at the summit.
  const points = ordered.map((l) => ({ x: l.mapPosition.x, y: l.mapPosition.y }));

  const firstUnfinished =
    ordered.find((l) => !completed.includes(l.id))?.id ?? null;
  const activeId = currentLessonId ?? firstUnfinished;

  const isUnlocked = (index: number) => {
    if (index === 0) return true;
    return completed.includes(ordered[index - 1].id);
  };

  /** A module's last lesson gets a reward chest beside it. */
  const chestAfter = new Set(
    modules
      .map((m) => {
        const inModule = ordered.filter((l) => l.moduleId === m.id);
        return inModule.length ? inModule[inModule.length - 1].id : null;
      })
      .filter(Boolean) as string[],
  );

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      {/* aspect box keeps node positions honest at any width */}
      <div className="relative w-full" style={{ paddingBottom: "160%" }}>
        <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100">
          {/* decorative land shape */}
          <svg
            viewBox="0 0 100 160"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d="M 8 160 C 20 120, 5 95, 25 70 C 40 50, 30 25, 55 8 L 92 8 L 92 160 Z"
              fill="rgba(255,255,255,0.35)"
            />
          </svg>

          {/* the road */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d={roadPath(points)}
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="2.4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={roadPath(points)}
              fill="none"
              stroke="rgba(148,163,184,0.5)"
              strokeWidth="1"
              strokeDasharray="3 4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* nodes */}
          {ordered.map((lesson, i) => {
            const done = completed.includes(lesson.id);
            const unlocked = isUnlocked(i);
            const isCurrent = lesson.id === activeId;
            const color = colorOf(lesson.moduleId);

            const node = (
              <div
                className={`grid h-11 w-11 place-items-center rounded-full border-4 border-white text-sm font-bold shadow-lg transition ${
                  unlocked ? "hover:scale-110" : "cursor-not-allowed"
                }`}
                style={{
                  backgroundColor: unlocked ? color : "#cbd5e1",
                  color: "white",
                }}
              >
                {done ? (
                  <Check className="h-5 w-5" />
                ) : unlocked ? (
                  i + 1
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </div>
            );

            return (
              <div
                key={lesson.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${lesson.mapPosition.x}%`, top: `${lesson.mapPosition.y}%` }}
              >
                {isCurrent && (
                  <span className="absolute -inset-1.5 animate-ping rounded-full bg-white/70" />
                )}
                <div className="relative">
                  {unlocked ? (
                    <Link
                      href={`/${locale}/lesson/${lesson.id}`}
                      title={pick(lesson.title, locale)}
                    >
                      {node}
                    </Link>
                  ) : (
                    <div title={t("track.locked")}>{node}</div>
                  )}

                  {chestAfter.has(lesson.id) && (
                    <div className="absolute -right-9 top-1 grid h-8 w-8 place-items-center rounded-lg bg-amber-400 text-white shadow-md">
                      <Gift className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
