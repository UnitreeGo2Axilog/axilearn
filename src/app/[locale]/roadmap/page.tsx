"use client";

/**
 * The mission map screen -- a full-viewport game world.
 *
 * Layout: HUD pinned at the top, the map filling ALL the space between it and
 * the mission card, card pinned at the bottom. Nothing is centred in a narrow
 * column: on a laptop the map spreads across the whole window (the reference
 * shows an entire mission map filling the screen), while on a phone it keeps a
 * minimum height so the route never squashes into an unreadable strip.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";
import {
  learner,
  tracks,
  trackProgress,
  type Level,
  type RoadmapTrack,
} from "@/content/roadmap-data";
import { RoadmapCanvas } from "@/components/roadmap/roadmap-canvas";
import { TopStatusBar } from "@/components/roadmap/top-status-bar";
import { BottomLessonPanel } from "@/components/roadmap/bottom-lesson-panel";
import { TrackSwitcher } from "@/components/roadmap/track-switcher";
import { useLocale } from "@/i18n/use-t";

export default function RoadmapPage() {
  const locale = useLocale();
  const [track, setTrack] = useState<RoadmapTrack>(
    tracks.find((t) => t.id === learner.activeTrackId) ?? tracks[0],
  );
  const [selected, setSelected] = useState<Level | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSelected(track.levels.find((l) => l.state === "current") ?? track.levels[0]);
  }, [track]);

  const pct = useMemo(() => trackProgress(track), [track]);

  function choose(level: Level) {
    setSelected(level);
    if (level.state === "locked") {
      setToast("Finish the mission before this one to unlock it");
      setTimeout(() => setToast(null), 2200);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-app">
      <TopStatusBar
        name={learner.name}
        level={learner.level}
        currentXp={learner.currentXp}
        nextLevelXp={learner.nextLevelXp}
        streakDays={learner.streakDays}
        coins={learner.coins}
        trackShort={track.short}
        accent={track.color}
      />

      {/* track bar: switcher + headline, full width */}
      <div className="mx-auto w-full max-w-7xl px-3">
        <TrackSwitcher activeId={track.id} onChange={setTrack} />
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <h1 className="text-xl font-extrabold text-strong sm:text-2xl">{track.title}</h1>
            <p className="text-xs text-muted sm:text-sm">{track.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-robot text-xl font-bold" style={{ color: track.color }}>
              {pct}%
            </p>
            <p className="text-[10px] uppercase tracking-wide text-faint">complete</p>
          </div>
        </div>
      </div>

      {/* THE MAP -- fills the rest of the viewport, min height on small screens */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-3">
        <div className="h-[max(620px,calc(100vh-330px))] w-full">
          <RoadmapCanvas track={track} selectedId={selected?.id ?? null} onSelect={choose} />
        </div>
      </div>

      {/* leaves room for the fixed mission card */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-56 pt-4">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-faint transition hover:opacity-80"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to AxiLearn
        </Link>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="panel fixed inset-x-0 top-28 z-50 mx-auto w-fit rounded-xl px-4 py-2 text-xs font-semibold backdrop-blur"
          >
            <span className="inline-flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5" />
              {toast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomLessonPanel level={selected} trackTitle={track.title} accent={track.color} />
    </div>
  );
}
