"use client";

/**
 * Fixed top HUD: who you are, what level, how much XP to the next one, your
 * streak and how many lessons you have cleared -- the "I am progressing"
 * signal, always on screen.
 *
 * There was a coin counter here, but nothing on the platform earns or spends
 * coins, so it was being fed the XP total: two icons showing one number. It
 * counts cleared lessons now, which is a thing that actually happens.
 */
import Link from "next/link";
import { Flame, Menu, Trophy } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip } from "@/components/tooltip";

interface Props {
  name: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  done: number;
  trackShort: string;
  accent: string;
  /** Where the top-left icon goes -- the map has no other way back. */
  homeHref: string;
  homeLabel: string;
}

export function TopStatusBar({
  name,
  level,
  currentXp,
  nextLevelXp,
  streakDays,
  done,
  trackShort,
  accent,
  homeHref,
  homeLabel,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 88%, transparent)" }}>
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-2.5">
        <Tooltip label={homeLabel}>
          <Link
            href={homeHref}
            aria-label={homeLabel}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-main transition hover:opacity-80"
            style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
          >
            <Menu className="h-4 w-4" />
          </Link>
        </Tooltip>

        {/* avatar + level badge */}
        <div className="relative shrink-0">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl text-sm font-black text-slate-900"
            style={{ background: `linear-gradient(135deg, ${accent}, var(--cleared))` }}
          >
            {name.slice(0, 1).toUpperCase()}
          </div>
          <span
            className="absolute -bottom-1.5 -right-1.5 rounded-md px-1.5 text-[10px] font-black"
            style={{ background: "var(--reward)", color: "var(--surface-solid)", border: "1px solid var(--bg)" }}
          >
            {level}
          </span>
        </div>

        {/* name + xp */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-bold text-strong">{name}</p>
            <p className="shrink-0 font-robot text-[10px] tracking-wider"
              style={{ color: "var(--neon)" }}>
              {currentXp}/{nextLevelXp} XP
            </p>
          </div>
          {/* the XP bar itself now lives on the main page, next to the
              tracks -- see components/learner-strip.tsx */}
        </div>

        {/* streak + lessons cleared */}
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <span className="inline-flex items-center gap-1 rounded-lg border border-orange-400/25 bg-orange-400/10 px-2 py-1 text-xs font-bold text-orange-300">
            <Flame className="h-3.5 w-3.5" />
            {streakDays}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold"
            style={{
              borderColor: "color-mix(in srgb, var(--cleared) 30%, transparent)",
              background: "color-mix(in srgb, var(--cleared) 12%, transparent)",
              color: "var(--cleared)",
            }}
          >
            <Trophy className="h-3.5 w-3.5" />
            {done}
          </span>
        </div>
      </div>

      {/* current track chip */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-2">
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
