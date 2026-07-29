"use client";

/**
 * A single node on the mission map.
 *
 * Hexagons, like the reference mission map -- drawn with CSS clip-path so they
 * stay crisp and cheap (no SVG per node). Five visual states, each readable at
 * a glance without reading text:
 *
 *   completed     lime-green fill, tick, steady glow
 *   current       cyan, larger, breathing halo + rotating ring
 *   locked        desaturated slate, padlock, no glow
 *   project       purple, trophy, slightly larger
 *   final_project the biggest, gold, crown, dramatic glow
 */
import { motion, useReducedMotion } from "framer-motion";
import { Check, Crown, Flag, Lock, Trophy } from "lucide-react";
import type { Level } from "@/content/roadmap-data";

const HEX = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

interface Props {
  level: Level;
  index: number;
  selected: boolean;
  accent: string;
  onSelect: (level: Level) => void;
}

function look(level: Level, accent: string) {
  if (level.state === "locked") {
    return { fill: "#1e293b", ring: "#334155", text: "#64748b", glow: "0,0,0", size: 56 };
  }
  if (level.state === "current") {
    return { fill: "#0e7490", ring: accent, text: "#e0f2fe", glow: "34,211,238", size: 72 };
  }
  // completed
  if (level.type === "final_project")
    return { fill: "#a16207", ring: "#fbbf24", text: "#fffbeb", glow: "251,191,36", size: 76 };
  return { fill: "#3f6212", ring: "#a3e635", text: "#f7fee7", glow: "163,230,53", size: 56 };
}

function Icon({ level }: { level: Level }) {
  const cls = "h-6 w-6";
  if (level.state === "locked") return <Lock className="h-5 w-5" />;
  if (level.state === "completed") return <Check className={cls} strokeWidth={3.5} />;
  if (level.type === "final_project") return <Crown className={cls} />;
  if (level.type === "project") return <Trophy className={cls} />;
  if (level.type === "checkpoint") return <Flag className={cls} />;
  return <span className="text-lg font-black">{level.title.slice(0, 1)}</span>;
}

export function RoadmapNode({ level, index, selected, accent, onSelect }: Props) {
  const reduce = useReducedMotion();
  const s = look(level, accent);
  const isCurrent = level.state === "current";
  const isBoss = level.type === "final_project";
  const size = isBoss ? s.size + 8 : s.size;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${level.position.x}%`, top: `${level.position.y}%` }}
    >
      {/* breathing halo on the active node */}
      {isCurrent && !reduce && (
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: size + 34, height: size + 34, background: `rgba(${s.glow},0.18)` }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.15, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.button
        type="button"
        onClick={() => onSelect(level)}
        aria-label={`${level.title} — ${level.state}`}
        aria-current={selected ? "true" : undefined}
        whileTap={{ scale: 0.92 }}
        whileHover={level.state !== "locked" ? { scale: 1.08 } : undefined}
        initial={reduce ? false : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduce ? 0 : index * 0.05, type: "spring", stiffness: 260, damping: 18 }}
        className="relative grid place-items-center outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60"
        style={{ width: size, height: size }}
      >
        {/* outer hex = the glowing rim */}
        <span
          className="absolute inset-0"
          style={{
            clipPath: HEX,
            background: s.ring,
            filter:
              level.state === "locked"
                ? "none"
                : `drop-shadow(0 0 ${isCurrent || isBoss ? 16 : 9}px rgba(${s.glow},0.9))`,
          }}
        />
        {/* inner hex = the fill */}
        <span
          className="absolute"
          style={{ inset: 3, clipPath: HEX, background: s.fill }}
        />
        {/* selection ring */}
        {selected && (
          <span
            className="absolute -inset-1.5"
            style={{ clipPath: HEX, background: `rgba(${s.glow},0.35)` }}
          />
        )}
        <span className="relative z-10" style={{ color: s.text }}>
          <Icon level={level} />
        </span>
      </motion.button>

      {/* label under the node */}
      <div className="pointer-events-none absolute left-1/2 top-full mt-1.5 w-32 -translate-x-1/2 text-center">
        <span
          className="text-[11px] font-semibold leading-tight"
          style={{ color: level.state === "locked" ? "#64748b" : "#cbd5e1" }}
        >
          {level.title}
        </span>
      </div>
    </div>
  );
}
