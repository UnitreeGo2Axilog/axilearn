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
    <div className="flex w-full gap-2 pb-3">
      {tracks.map((track) => {
        const active = track.id === activeId;
        const pct = trackProgress(track);
        return (
          <button
            key={track.id}
            onClick={() => onChange(track)}
            className="relative flex-1 overflow-hidden rounded-xl border px-2 py-2 text-left transition"
            style={{
              borderColor: active ? `${track.color}88` : "var(--border)",
              background: active ? `${track.color}1f` : "var(--bg-2)",
            }}
          >
            <span
              className="block font-robot text-[10px] font-bold tracking-[0.16em]"
              style={{ color: active ? track.color : "var(--text-faint)" }}
            >
              {track.short}
            </span>
            <span className="mt-1 block h-1 w-full overflow-hidden rounded-full"
              style={{ background: "color-mix(in srgb, var(--text) 14%, transparent)" }}>
              <motion.span
                className="block h-full rounded-full"
                style={{ background: track.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6 }}
              />
            </span>
            <span className="mt-1 block text-[10px] font-semibold text-faint">{pct}%</span>
          </button>
        );
      })}
    </div>
  );
}
