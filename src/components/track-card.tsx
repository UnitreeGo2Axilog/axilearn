"use client";

/**
 * One mission-select card on the home page.
 *
 * Client-rendered for the same reason TrackCta and LearnerStrip already are:
 * progress is per-learner, and the track object arriving from the server has
 * no completed lessons applied (getMainTracks builds it with an empty
 * completed-set, since the server render isn't personalized). Before this,
 * the card's percentage read `trackProgress(track)` on that unpersonalized
 * object, so every learner saw ~0% here regardless of what they had actually
 * finished -- the map and profile were already fixed to read real progress;
 * this card on the home page was the one place still lying.
 *
 * The certificate badge in the corner reuses the exact same 100%-of-levels
 * check the certificate page itself uses, so a badge appearing here is a
 * promise the certificate page will actually keep.
 */
import Link from "next/link";
import { ArrowRight, Award, Lock, Swords } from "lucide-react";
import type { RoadmapTrack } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { useT } from "@/i18n/use-t";
import { Tooltip } from "@/components/tooltip";

export function TrackCard({
  track,
  locale,
  locked,
  challengeCount,
}: {
  track: RoadmapTrack;
  locale: string;
  locked: boolean;
  challengeCount: number;
}) {
  const t = useT();
  const { completedIds } = useProgress();

  const done = track.levels.filter((l) => completedIds.has(l.id)).length;
  const pct = track.levels.length ? Math.round((done / track.levels.length) * 100) : 0;
  const certified = !locked && track.levels.length > 0 && pct === 100;

  const card = (
    <div
      className="group relative h-full overflow-hidden rounded-2xl border p-5 transition"
      style={{
        borderColor: locked ? "var(--border)" : `${track.color}66`,
        background: "var(--surface)",
        boxShadow: locked ? "none" : `0 0 26px rgba(${track.glow},0.12)`,
      }}
    >
      {/* corner accent */}
      <span
        aria-hidden
        className="absolute right-0 top-0 h-16 w-16 opacity-25"
        style={{ background: `radial-gradient(circle at top right, ${track.color}, transparent 70%)` }}
      />

      {/* corner signals: challenges (always, if any exist) and the
          certificate (only once the track is genuinely 100% done) */}
      {(!locked && challengeCount > 0) || certified ? (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          {!locked && challengeCount > 0 && (
            <Tooltip label={t("challenges.entryTitle") + ` (${challengeCount})`}>
              <span
                className="grid h-8 w-8 place-items-center rounded-full border-2"
                style={{
                  borderColor: "var(--border-strong)",
                  background: "var(--surface-solid)",
                  color: "var(--text-muted)",
                }}
              >
                <Swords className="h-4 w-4" />
              </span>
            </Tooltip>
          )}
          {certified && (
            <Tooltip label={t("cert.earnedFor").replace("{track}", track.title)}>
              <span
                className="grid h-8 w-8 place-items-center rounded-full border-2"
                style={{
                  borderColor: "var(--reward)",
                  background: "var(--surface-solid)",
                  color: "var(--reward)",
                  boxShadow: "0 0 12px color-mix(in srgb, var(--reward) 55%, transparent)",
                }}
              >
                <Award className="h-4 w-4" />
              </span>
            </Tooltip>
          )}
        </div>
      ) : null}

      <span
        className="font-robot text-2xl font-black tracking-[0.18em]"
        style={{ color: locked ? "var(--text-faint)" : track.color }}
      >
        {track.short}
      </span>
      <h2 className="mt-2 text-lg font-bold text-strong">{track.title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{track.description}</p>

      {locked ? (
        <span
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-muted"
          style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
        >
          <Lock className="h-3 w-3" />
          {t("home.comingSoon")}
        </span>
      ) : (
        <>
          <div
            className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "color-mix(in srgb, var(--text) 14%, transparent)" }}
          >
            <span
              className="block h-full rounded-full"
              style={{ width: `${pct}%`, background: track.color, boxShadow: `0 0 10px ${track.color}` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-faint">
              {track.levels.length} {t("home.lessons")} · {pct}%
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wide transition group-hover:gap-2.5"
              style={{ background: track.color, color: "var(--surface-solid)" }}
            >
              {t("home.start")}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </>
      )}
    </div>
  );

  return locked ? (
    <div className="h-full opacity-70">{card}</div>
  ) : (
    <Link href={`/${locale}/track/${track.id}`} className="h-full">
      {card}
    </Link>
  );
}
