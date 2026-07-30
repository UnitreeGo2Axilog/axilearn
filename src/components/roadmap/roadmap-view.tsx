"use client";

/**
 * The mission map screen -- a full-viewport game world.
 *
 * Layout: HUD pinned at the top, the map filling ALL the space between it and
 * the mission card, card pinned at the bottom. Nothing is centred in a narrow
 * column: on a laptop the map spreads across the whole window (the reference
 * shows an entire mission map filling the screen), while on a phone it keeps a
 * minimum height so the route never squashes into an unreadable strip.
 *
 * The content itself arrives as props -- the page above fetches it on the
 * server, so the map never waits on a client round-trip before drawing.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";
import { learner, trackProgress, type Level, type RoadmapTrack } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { useAuth } from "@/lib/auth-context";
import { RoadmapCanvas } from "@/components/roadmap/roadmap-canvas";
import { TopStatusBar } from "@/components/roadmap/top-status-bar";
import { BottomLessonPanel } from "@/components/roadmap/bottom-lesson-panel";
import { TrackSwitcher } from "@/components/roadmap/track-switcher";
import { useLocale } from "@/i18n/use-t";

export function RoadmapView({
  track: raw,
  switcherTracks: rawSwitcher,
}: {
  track: RoadmapTrack;
  switcherTracks: RoadmapTrack[];
}) {
  const locale = useLocale();
  const { profile } = useAuth();
  const { completedIds, level: myLevel, into, span, streak } = useProgress();

  // The server sends content; which nodes are cleared is this learner's
  // business, so the states are recomputed here from their own record.
  const track = useMemo(() => withProgress(raw, completedIds), [raw, completedIds]);
  const switcherTracks = useMemo(
    () => rawSwitcher.map((t) => withProgress(t, completedIds)),
    [rawSwitcher, completedIds],
  );
  const [selected, setSelected] = useState<Level | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSelected(track.levels.find((l) => l.state === "current") ?? track.levels[0] ?? null);
  }, [track]);

  const pct = useMemo(() => trackProgress(track), [track]);

  function choose(level: Level) {
    setSelected(level);
    if (level.state === "locked") {
      setToast(
        locale === "fr"
          ? "Termine la mission précédente pour débloquer celle-ci"
          : "Finish the mission before this one to unlock it",
      );
      setTimeout(() => setToast(null), 2200);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-app">
      <TopStatusBar
        name={profile?.displayName ?? learner.name}
        level={myLevel}
        currentXp={into}
        nextLevelXp={span}
        streakDays={streak}
        done={completedIds.size}
        trackShort={track.short}
        accent={track.color}
      />

      {/* track bar: switcher + headline, full width */}
      <div className="mx-auto w-full max-w-7xl px-3">
        <TrackSwitcher activeId={track.id} tracks={switcherTracks} />
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <h1 className="text-xl font-extrabold text-strong sm:text-2xl">{track.title}</h1>
            <p className="text-xs text-muted sm:text-sm">{track.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-robot text-xl font-bold" style={{ color: track.color }}>
              {pct}%
            </p>
            <p className="text-[10px] uppercase tracking-wide text-faint">
              {locale === "fr" ? "terminé" : "complete"}
            </p>
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
          {locale === "fr" ? "Retour à AxiLearn" : "Back to AxiLearn"}
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

      <BottomLessonPanel
        level={selected}
        trackId={track.id}
        trackTitle={track.title}
        trackComplete={pct === 100}
        accent={track.color}
      />
    </div>
  );
}

/**
 * Re-state a track for one learner: everything they have finished is cleared,
 * the first thing they have not is open, the rest stay locked.
 */
function withProgress(track: RoadmapTrack, completed: Set<string>): RoadmapTrack {
  let currentTaken = false;
  return {
    ...track,
    levels: track.levels.map((level) => {
      if (completed.has(level.id)) return { ...level, state: "completed" as const };
      if (!currentTaken) {
        currentTaken = true;
        return { ...level, state: "current" as const };
      }
      return { ...level, state: "locked" as const };
    }),
  };
}
