"use client";

/** Switch between the three worlds without leaving the map. */
import { motion } from "framer-motion";
import { tracks, trackProgress, type RoadmapTrack } from "@/content/roadmap-data";

interface Props {
  activeId: string;
  onChange: (track: RoadmapTrack) => void;
}

export function TrackSwitcher({ activeId, onChange }: Props) {
  return (
    <div className="mx-auto flex max-w-md gap-2 px-3 pb-3">
      {tracks.map((track) => {
        const active = track.id === activeId;
        const pct = trackProgress(track);
        return (
          <button
            key={track.id}
            onClick={() => onChange(track)}
            className="relative flex-1 overflow-hidden rounded-xl border px-2 py-2 text-left transition"
            style={{
              borderColor: active ? `${track.color}88` : "rgba(255,255,255,0.08)",
              background: active ? `${track.color}14` : "rgba(255,255,255,0.03)",
            }}
          >
            <span
              className="block font-robot text-[10px] font-bold tracking-[0.16em]"
              style={{ color: active ? track.color : "#64748b" }}
            >
              {track.short}
            </span>
            <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-white/10">
              <motion.span
                className="block h-full rounded-full"
                style={{ background: track.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6 }}
              />
            </span>
            <span className="mt-1 block text-[10px] font-semibold text-slate-500">{pct}%</span>
          </button>
        );
      })}
    </div>
  );
}
