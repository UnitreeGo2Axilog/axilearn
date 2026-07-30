"use client";

/**
 * The "enter the map" panel at the bottom of a track briefing.
 *
 * It is a client component for one reason: the briefing page is rendered on the
 * server, where nobody's progress is known, so it used to compute its
 * percentage from content alone and therefore always read "ready to start" --
 * even for someone who had finished half the track. Progress is per-learner, so
 * the part that reports progress has to run where the learner is.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RoadmapTrack } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { useT } from "@/i18n/use-t";

export function TrackCta({ track, locale }: { track: RoadmapTrack; locale: string }) {
  const t = useT();
  const { completedIds } = useProgress();

  const done = track.levels.filter((l) => completedIds.has(l.id)).length;
  const pct = track.levels.length ? Math.round((done / track.levels.length) * 100) : 0;

  return (
    <section
      className="flex flex-col items-center gap-4 rounded-2xl border p-6 text-center"
      style={{
        borderColor: `${track.color}55`,
        background: `color-mix(in srgb, ${track.color} 7%, var(--surface))`,
      }}
    >
      <p className="text-sm text-muted">
        {pct > 0
          ? `${done}/${track.levels.length} · ${pct}% ${t("track.alreadyDone")}`
          : t("track.readyToStart")}
      </p>

      {pct > 0 && (
        <span
          className="h-2 w-full max-w-xs overflow-hidden rounded-full"
          style={{ background: "color-mix(in srgb, var(--text) 12%, transparent)" }}
        >
          <span
            className="block h-full rounded-full"
            style={{ width: `${pct}%`, background: track.color }}
          />
        </span>
      )}

      <Link
        href={`/${locale}/roadmap/${track.id}`}
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-black uppercase tracking-wide"
        style={{ background: track.color, color: "var(--surface-solid)" }}
      >
        {pct > 0 ? t("track.continue") : t("track.enterMap")}
        <ArrowRight className="h-5 w-5" />
      </Link>
    </section>
  );
}
