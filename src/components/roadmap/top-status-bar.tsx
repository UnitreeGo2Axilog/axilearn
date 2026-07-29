"use client";

/**
 * Fixed top HUD: who you are, what level, how much XP to the next one, your
 * streak and coins -- the "I am progressing" signal, always on screen.
 */
import { motion } from "framer-motion";
import { Coins, Flame, Menu } from "lucide-react";

interface Props {
  name: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  coins: number;
  trackShort: string;
  accent: string;
  onMenu?: () => void;
}

export function TopStatusBar({
  name,
  level,
  currentXp,
  nextLevelXp,
  streakDays,
  coins,
  trackShort,
  accent,
  onMenu,
}: Props) {
  const pct = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#050914]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center gap-3 px-3 py-2.5">
        <button
          onClick={onMenu}
          aria-label="Menu"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* avatar + level badge */}
        <div className="relative shrink-0">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl text-sm font-black text-slate-900"
            style={{ background: `linear-gradient(135deg, ${accent}, #a3e635)` }}
          >
            {name.slice(0, 1).toUpperCase()}
          </div>
          <span
            className="absolute -bottom-1.5 -right-1.5 rounded-md border border-[#050914] px-1.5 text-[10px] font-black text-slate-900"
            style={{ background: "#fbbf24" }}
          >
            {level}
          </span>
        </div>

        {/* name + xp */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-bold text-slate-100">{name}</p>
            <p className="shrink-0 font-robot text-[10px] tracking-wider text-cyan-300">
              {currentXp}/{nextLevelXp} XP
            </p>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${accent}, #a3e635)` }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* streak + coins */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg border border-orange-400/25 bg-orange-400/10 px-2 py-1 text-xs font-bold text-orange-300">
            <Flame className="h-3.5 w-3.5" />
            {streakDays}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300/25 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-300">
            <Coins className="h-3.5 w-3.5" />
            {coins}
          </span>
        </div>
      </div>

      {/* current track chip */}
      <div className="mx-auto max-w-md px-3 pb-2">
        <span
          className="inline-block rounded-md px-2 py-0.5 font-robot text-[10px] font-bold tracking-[0.2em]"
          style={{ color: accent, background: `${accent}1a`, border: `1px solid ${accent}40` }}
        >
          {trackShort}
        </span>
      </div>
    </header>
  );
}
