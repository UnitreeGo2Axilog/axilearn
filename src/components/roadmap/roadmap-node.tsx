"use client";

/**
 * A node on the mission map.
 *
 * Matched to the reference art: a DARK hexagon with a bright glowing outline
 * and a coloured icon inside -- not a filled blob. The glow is what carries
 * the state:
 *
 *   completed  cyan-teal outline + lime tick, strong halo (the reference look)
 *   current    cyan outline, larger, breathing halo + inner fill
 *   locked     dim slate outline, no glow, padlock
 *   project    violet outline, trophy
 *   final      gold outline, crown, biggest
 */
import { motion, useReducedMotion } from "framer-motion";
import { Check, Crown, Flag, Lock, Trophy } from "lucide-react";
import type { Level } from "@/content/roadmap-data";

const HEX = "polygon(50% 2%, 95% 26%, 95% 74%, 50% 98%, 5% 74%, 5% 26%)";

interface Props {
  level: Level;
  index: number;
  selected: boolean;
  accent: string;
  onSelect: (level: Level) => void;
}

function style(level: Level) {
  if (level.state === "locked")
    return { rim: "var(--route-dim)", icon: "var(--text-faint)", glow: "51,65,85", size: 50, halo: 0 };
  if (level.state === "current")
    return { rim: "var(--neon)", icon: "var(--neon)", glow: "34,211,238", size: 66, halo: 26 };
  if (level.type === "final_project")
    return { rim: "var(--reward)", icon: "var(--reward)", glow: "251,191,36", size: 68, halo: 22 };
  if (level.type === "project")
    return { rim: "var(--advanced)", icon: "var(--advanced)", glow: "167,139,250", size: 58, halo: 18 };
  // completed / checkpoint -> the reference's teal ring + green tick
  return { rim: "var(--teal-rim)", icon: "var(--cleared)", glow: "45,212,191", size: 54, halo: 18 };
}

function NodeIcon({ level, color }: { level: Level; color: string }) {
  const p = { className: "h-5 w-5", style: { color } };
  if (level.state === "locked") return <Lock {...p} />;
  if (level.state === "completed") return <Check className="h-6 w-6" strokeWidth={4} style={{ color }} />;
  if (level.type === "final_project") return <Crown {...p} />;
  if (level.type === "project") return <Trophy {...p} />;
  if (level.type === "checkpoint") return <Flag {...p} />;
  return <span className="font-robot text-xs font-bold" style={{ color }}>{level.id.split("-")[1]}</span>;
}

export function RoadmapNode({ level, index, selected, onSelect }: Props) {
  const reduce = useReducedMotion();
  const s = style(level);
  const isCurrent = level.state === "current";

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${level.position.x}%`, top: `${level.position.y}%` }}
    >
      {/* soft outer halo, like the reference nodes bleeding light into the map */}
      {s.halo > 0 && (
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
          style={{
            width: s.size + s.halo,
            height: s.size + s.halo,
            background: `radial-gradient(circle, rgba(${s.glow},var(--halo-alpha)), transparent 70%)`,
          }}
        />
      )}

      {/* breathing ring on the active node */}
      {isCurrent && !reduce && (
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: s.size + 20, height: s.size + 20, clipPath: HEX, background: `rgba(${s.glow},0.35)` }}
          animate={{ scale: [1, 1.22, 1], opacity: [0.55, 0.1, 0.55] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.button
        type="button"
        onClick={() => onSelect(level)}
        aria-label={`${level.title} — ${level.state}`}
        aria-current={selected ? "true" : undefined}
        whileTap={{ scale: 0.92 }}
        whileHover={level.state !== "locked" ? { scale: 1.09 } : undefined}
        initial={reduce ? false : { opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduce ? 0 : index * 0.05, type: "spring", stiffness: 250, damping: 17 }}
        className="relative grid place-items-center outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/50"
        style={{ width: s.size, height: s.size }}
      >
        {/* glowing rim */}
        <span
          className="absolute inset-0"
          style={{
            clipPath: HEX,
            background: s.rim,
            filter: s.halo
              ? `drop-shadow(0 0 ${isCurrent ? 14 : 8}px rgba(${s.glow},var(--rim-glow)))`
              : "none",
          }}
        />
        {/* dark interior -- this is what makes it read as an outline node */}
        <span
          className="absolute"
          style={{
            inset: 3,
            clipPath: HEX,
            background: isCurrent ? "var(--node-inner-active)" : "var(--node-inner)",
          }}
        />
        {selected && (
          <span
            className="absolute -inset-2"
            style={{ clipPath: HEX, background: `rgba(${s.glow},0.22)` }}
          />
        )}
        <span className="relative z-10">
          <NodeIcon level={level} color={s.icon} />
        </span>
      </motion.button>

      <div className="pointer-events-none absolute left-1/2 top-full mt-1.5 w-28 -translate-x-1/2 text-center">
        <span
          className="text-[10px] font-semibold leading-tight"
          style={{ color: level.state === "locked" ? "var(--text-faint)" : "var(--text-muted)" }}
        >
          {level.title}
        </span>
      </div>
    </div>
  );
}
