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
    <div className="relative h-full w-full">
      {/* fills whatever space the page gives it -- the map IS the screen */}
      <div className="relative h-full w-full">
        <div className="absolute inset-0 overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#050914]">
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
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
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
            <rect width="100" height="100" fill="url(#grid)" />

            {/* city map: main avenues, side streets and blocks -- the
                reference reads as a night-time city seen from above */}
            <g stroke="rgba(45,212,191,0.22)" strokeWidth="0.35" fill="none" strokeLinecap="square">
              <path d="M-5 14 H26 V32 H58 V46 H105" />
              <path d="M-5 58 H18 V72 H52 V84 H105" />
              <path d="M105 8 H74 V22 H40 V8" />
              <path d="M-5 92 H32 V78 H70 V96 H105" />
              <path d="M12 -5 V20 M46 -5 V14 M84 4 V30 M64 54 V74 M28 82 V98 M92 70 V96" />
            </g>
            <g stroke="rgba(56,189,248,0.10)" strokeWidth="0.3" fill="none">
              {Array.from({ length: 11 }).map((_, i) => (
                <path key={`h${i}`} d={`M-5 ${5 + i * 10} H105`} />
              ))}
              {Array.from({ length: 9 }).map((_, i) => (
                <path key={`v${i}`} d={`M${4 + i * 12} -5 V105`} />
              ))}
            </g>
            {/* lit city blocks */}
            {[[20,20,8,5],[66,30,9,6],[34,52,7,4],[74,62,8,5],[16,84,8,4],[58,92,9,5],[80,40,6,4]].map(
              ([x, y, w, h], i) => (
                <rect key={`b${i}`} x={x} y={y} width={w} height={h} rx="0.8"
                      fill="rgba(45,212,191,0.05)" stroke="rgba(45,212,191,0.16)" strokeWidth="0.25" />
              ),
            )}
            {/* street lights */}
            {[[26,32],[58,46],[18,72],[52,84],[74,22],[32,92],[70,96],[84,30]].map(([x, y], i) => (
              <circle key={`l${i}`} cx={x} cy={y} r="0.9" fill="rgba(34,211,238,0.55)" />
            ))}

            {/* star dust */}
            {Array.from({ length: 40 }).map((_, i) => {
              const x = (i * 37) % 100;
              const y = (i * 61) % 100;
              return <circle key={`s${i}`} cx={x} cy={y} r={i % 7 === 0 ? 0.5 : 0.3} fill="rgba(255,255,255,0.35)" />;
            })}
          </svg>

          {/* --- the road ------------------------------------------------ */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {/* full route, dim */}
            <path
              d={curve(pts)}
              fill="none"
              stroke="rgba(100,116,139,0.45)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="0.5 6"
              vectorEffect="non-scaling-stroke"
            />
            {/* cleared part, glowing */}
            {clearedCount > 1 && (
              <motion.path
                d={curve(pts, clearedCount)}
                fill="none"
                stroke="#d9f99d"
                strokeWidth="2.6"
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
