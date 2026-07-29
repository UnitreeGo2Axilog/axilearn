"use client";

/**
 * The mission map itself: background world, glowing path, nodes.
 *
 * The path is one SVG curve through the node positions. It is drawn twice --
 * the whole route dim, then the part the learner has already cleared painted
 * over it in lime with a glow filter -- so progress is instantly visible, the
 * way a game map lights up behind you.
 *
 * The background is layered: deep navy base, a perspective grid, abstract
 * "city circuitry" lines, and star dust. All SVG/CSS, no image files.
 */
import { motion, useReducedMotion } from "framer-motion";
import type { Level, RoadmapTrack } from "@/content/roadmap-data";
import { RoadmapNode } from "./roadmap-node";

interface Props {
  track: RoadmapTrack;
  selectedId: string | null;
  onSelect: (level: Level) => void;
}

/** Smooth curve through points (Catmull-Rom -> cubic bezier). */
function curve(pts: { x: number; y: number }[], upTo = pts.length): string {
  const p = pts.slice(0, Math.max(upTo, 0));
  if (p.length < 2) return "";
  const d = [`M ${p[0].x} ${p[0].y}`];
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] ?? p[i];
    const b = p[i];
    const c = p[i + 1];
    const e = p[i + 2] ?? c;
    d.push(
      `C ${b.x + (c.x - a.x) / 6} ${b.y + (c.y - a.y) / 6}, ` +
        `${c.x - (e.x - b.x) / 6} ${c.y - (e.y - b.y) / 6}, ${c.x} ${c.y}`,
    );
  }
  return d.join(" ");
}

export function RoadmapCanvas({ track, selectedId, onSelect }: Props) {
  const reduce = useReducedMotion();
  const levels = track.levels;
  const pts = levels.map((l) => l.position);

  // How far the "cleared" road reaches: through the last completed node, and
  // half-way towards the current one.
  const clearedCount = levels.filter((l) => l.state === "completed").length;

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* tall canvas -- this is a world you scroll through, not a card */}
      <div className="relative w-full" style={{ paddingBottom: "260%" }}>
        <div className="absolute inset-0 overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#050914]">
          {/* --- background world --------------------------------------- */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(700px 400px at 20% 8%, rgba(34,211,238,.12), transparent 60%)," +
                "radial-gradient(600px 380px at 85% 40%, rgba(167,139,250,.12), transparent 60%)," +
                "radial-gradient(700px 500px at 40% 95%, rgba(163,230,53,.08), transparent 60%)",
            }}
          />
          <svg viewBox="0 0 100 260" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {/* grid */}
            <defs>
              <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M8 0 L0 0 0 8" fill="none" stroke="rgba(56,189,248,0.09)" strokeWidth="0.3" />
              </pattern>
              <filter id="pathGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="1.6" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="100" height="260" fill="url(#grid)" />

            {/* abstract city circuitry */}
            <g stroke="rgba(56,189,248,0.16)" strokeWidth="0.4" fill="none">
              <path d="M-5 40 H30 V70 H62 V96 H105" />
              <path d="M-5 130 H22 V158 H55 V186 H105" />
              <path d="M105 22 H78 V52 H44" />
              <path d="M-5 210 H35 V236 H105" />
            </g>
            {/* nodes of the circuitry */}
            {[[30, 70], [62, 96], [22, 158], [55, 186], [78, 52], [35, 236]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="0.8" fill="rgba(56,189,248,0.4)" />
            ))}

            {/* star dust */}
            {Array.from({ length: 40 }).map((_, i) => {
              const x = (i * 37) % 100;
              const y = (i * 61) % 260;
              return <circle key={`s${i}`} cx={x} cy={y} r={i % 7 === 0 ? 0.5 : 0.3} fill="rgba(255,255,255,0.35)" />;
            })}
          </svg>

          {/* --- the road ------------------------------------------------ */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {/* full route, dim */}
            <path
              d={curve(pts)}
              fill="none"
              stroke="rgba(100,116,139,0.5)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="0.5 6"
              vectorEffect="non-scaling-stroke"
            />
            {/* cleared part, glowing */}
            {clearedCount > 1 && (
              <motion.path
                d={curve(pts, clearedCount)}
                fill="none"
                stroke="#a3e635"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#pathGlow)"
                vectorEffect="non-scaling-stroke"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            )}
          </svg>

          {/* --- section labels ------------------------------------------ */}
          {levels.map((l) =>
            l.section ? (
              <div
                key={`sec-${l.id}`}
                className="absolute -translate-y-1/2 select-none"
                style={{ left: "4%", top: `${l.position.y - 3.2}%` }}
              >
                <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  {l.section}
                </span>
              </div>
            ) : null,
          )}

          {/* --- nodes --------------------------------------------------- */}
          {levels.map((level, i) => (
            <RoadmapNode
              key={level.id}
              level={level}
              index={i}
              accent={track.color}
              selected={selectedId === level.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
