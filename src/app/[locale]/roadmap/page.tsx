"use client";

/**
 * The mission map screen.
 *
 * Mobile-first by construction: a fixed HUD on top, a tall scrollable world in
 * the middle, and a fixed mission card at the bottom -- the same shape as the
 * game reference. On wider screens the map stays centred and phone-width
 * rather than stretching into a dashboard, which is what kills the game feel.
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

  // Preselect the lesson the learner is on, so the card is never empty.
  useEffect(() => {
    const current = track.levels.find((l) => l.state === "current") ?? track.levels[0];
    setSelected(current);
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
    <div className="min-h-screen bg-[#050914]">
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

      <TrackSwitcher activeId={track.id} onChange={setTrack} />

      {/* track headline + completion */}
      <div className="mx-auto mb-3 max-w-md px-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-50">{track.title}</h1>
            <p className="text-xs text-slate-400">{track.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-robot text-lg font-bold" style={{ color: track.color }}>
              {pct}%
            </p>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">complete</p>
          </div>
        </div>
      </div>

      {/* the world -- extra bottom padding so the fixed card never covers it */}
      <div className="px-3 pb-64">
        <RoadmapCanvas track={track} selectedId={selected?.id ?? null} onSelect={choose} />

        <div className="mx-auto mt-6 max-w-md">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to AxiLearn
          </Link>
        </div>
      </div>

      {/* achievement / locked toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="fixed inset-x-0 top-24 z-50 mx-auto w-fit rounded-xl border border-cyan-400/30 bg-[#0a1020]/95 px-4 py-2 text-xs font-semibold text-cyan-200 backdrop-blur"
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
