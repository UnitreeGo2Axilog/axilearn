"use client";

/**
 * The journey map -- the learner's road through a track.
 *
 * Inspired by the Kalimat Crash level road the supervisor pointed at, but
 * drawn entirely in SVG so it stays sharp, weighs nothing and needs no
 * artwork files:
 *
 *  - The road is one smooth curve drawn THROUGH the lesson coordinates, so
 *    adding a lesson bends the road automatically.
 *  - The finished part of the road is drawn in the chapter colour on top of
 *    the unfinished part, so progress reads at a glance.
 *  - Nodes are chunky "sticker" buttons: done = filled with a tick, current =
 *    larger with a pulsing halo, locked = grey with a padlock.
 *  - Scenery (hills, clouds, trees, stars) is generated from fixed numbers, so
 *    it never jumps around between renders.
 *  - A treasure chest sits at the end of every chapter.
 */
import Link from "next/link";
import { Check, Lock } from "lucide-react";
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

/** Smooth curve through the points (Catmull-Rom -> bezier). */
function road(points: { x: number; y: number }[], upTo = points.length): string {
  const pts = points.slice(0, Math.max(upTo, 0));
  if (pts.length < 2) return "";
  const d = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d.push(
      `C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ` +
        `${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`,
    );
  }
  return d.join(" ");
}

/** Simple treasure chest, drawn. */
function Chest({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 40 34" className="h-8 w-9 drop-shadow">
      <rect x="3" y="14" width="34" height="18" rx="4" fill="#b45309" />
      <path d="M3 16 a17 10 0 0 1 34 0 z" fill={open ? "#facc15" : "#d97706"} />
      <rect x="17" y="14" width="6" height="10" rx="2" fill="#fde68a" />
      <circle cx="20" cy="19" r="2.2" fill="#78350f" />
    </svg>
  );
}

export function JourneyMap({ lessons, modules, locale, completed, currentLessonId }: Props) {
  const t = useT();
  const ordered = [...lessons].sort((a, b) => a.order - b.order);
  const points = ordered.map((l) => l.mapPosition);
  const colorOf = (moduleId: string) =>
    modules.find((m) => m.id === moduleId)?.color ?? "#64748b";

  const firstUnfinished = ordered.find((l) => !completed.includes(l.id))?.id ?? null;
  const activeId = currentLessonId ?? firstUnfinished;
  const doneCount = ordered.filter((l) => completed.includes(l.id)).length;

  const unlocked = (i: number) => i === 0 || completed.includes(ordered[i - 1].id);

  const lastOfModule = new Set(
    modules
      .map((m) => {
        const inModule = ordered.filter((l) => l.moduleId === m.id);
        return inModule.length ? inModule[inModule.length - 1].id : null;
      })
      .filter(Boolean) as string[],
  );

  // Fixed decorations -- deterministic so nothing shifts between renders.
  const clouds = [
    { x: 14, y: 8, s: 1 },
    { x: 76, y: 16, s: 0.75 },
    { x: 30, y: 30, s: 0.6 },
    { x: 82, y: 46, s: 0.9 },
  ];
  const trees = [
    { x: 10, y: 62 }, { x: 88, y: 70 }, { x: 16, y: 86 },
    { x: 80, y: 92 }, { x: 12, y: 44 }, { x: 90, y: 26 },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative w-full" style={{ paddingBottom: "165%" }}>
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] border-4 border-white shadow-chunky">
          {/* sky -> land gradient: night at the summit, meadow at the start */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-400 via-sky-300 to-emerald-200" />

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {/* stars near the top (the goal) */}
            {[[22, 4], [40, 7], [64, 3], [80, 9], [52, 12]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="0.5" fill="white" opacity="0.9" />
            ))}

            {/* rolling hills */}
            <path d="M0 58 Q 25 48 50 57 T 100 54 L100 100 L0 100 Z" fill="rgba(255,255,255,0.25)" />
            <path d="M0 72 Q 30 62 55 71 T 100 68 L100 100 L0 100 Z" fill="rgba(255,255,255,0.3)" />

            {/* clouds */}
            {clouds.map((c, i) => (
              <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.s})`} opacity="0.85">
                <ellipse cx="0" cy="0" rx="5" ry="2.2" fill="white" />
                <ellipse cx="3" cy="-1" rx="3.4" ry="2" fill="white" />
                <ellipse cx="-3" cy="-0.6" rx="3" ry="1.7" fill="white" />
              </g>
            ))}

            {/* little trees */}
            {trees.map((tr, i) => (
              <g key={i} transform={`translate(${tr.x} ${tr.y})`}>
                <rect x="-0.4" y="0" width="0.8" height="2.4" fill="#92400e" />
                <circle cx="0" cy="-1.2" r="2.1" fill="#16a34a" />
                <circle cx="-1.1" cy="-0.2" r="1.4" fill="#22c55e" />
                <circle cx="1.1" cy="-0.3" r="1.3" fill="#15803d" />
              </g>
            ))}
          </svg>

          {/* the road: full path, then the completed part painted over it */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path
              d={road(points)}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="7"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={road(points)}
              fill="none"
              stroke="rgba(100,116,139,0.35)"
              strokeWidth="2"
              strokeDasharray="1 5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {doneCount > 1 && (
              <path
                d={road(points, doneCount)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="7"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* chapter labels, placed beside the first node of each chapter */}
          {modules.map((m) => {
            const first = ordered.find((l) => l.moduleId === m.id);
            if (!first) return null;
            return (
              <div
                key={m.id}
                className="absolute -translate-y-1/2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow-sm"
                style={{
                  left: `${first.mapPosition.x > 50 ? first.mapPosition.x - 42 : first.mapPosition.x + 9}%`,
                  top: `${first.mapPosition.y}%`,
                  color: m.color,
                }}
              >
                {pick(m.title, locale)}
              </div>
            );
          })}

          {/* lesson nodes */}
          {ordered.map((lesson, i) => {
            const done = completed.includes(lesson.id);
            const open = unlocked(i);
            const current = lesson.id === activeId;
            const color = colorOf(lesson.moduleId);

            const inner = (
              <div className="relative">
                {current && (
                  <span
                    className="absolute -inset-2 animate-ping rounded-full"
                    style={{ backgroundColor: `${color}55` }}
                  />
                )}
                <div
                  className={`relative grid place-items-center rounded-full border-[3px] border-white font-extrabold text-white transition ${
                    current ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm"
                  } ${open ? "hover:scale-110" : "cursor-not-allowed"}`}
                  style={{
                    backgroundColor: open ? color : "#94a3b8",
                    boxShadow: open
                      ? `0 5px 0 0 ${color}99, 0 8px 14px rgba(0,0,0,.18)`
                      : "0 4px 0 0 rgba(100,116,139,.6)",
                  }}
                >
                  {done ? <Check className="h-6 w-6" strokeWidth={3.5} /> : open ? i + 1 : <Lock className="h-4 w-4" />}
                </div>
              </div>
            );

            return (
              <div
                key={lesson.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${lesson.mapPosition.x}%`, top: `${lesson.mapPosition.y}%` }}
              >
                <div className="relative">
                  {open ? (
                    <Link href={`/${locale}/lesson/${lesson.id}`} title={pick(lesson.title, locale)}>
                      {inner}
                    </Link>
                  ) : (
                    <div title={t("track.locked")}>{inner}</div>
                  )}

                  {lastOfModule.has(lesson.id) && (
                    <div className="absolute -right-11 top-0">
                      <Chest open={done} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* start flag */}
          <div className="absolute bottom-2 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold text-slate-600 shadow">
            {locale === "fr" ? "DÉPART" : "START"}
          </div>
        </div>
      </div>
    </div>
  );
}
