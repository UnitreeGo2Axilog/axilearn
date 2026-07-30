"use client";

/**
 * Challenges for one track -- difficulty first, then the questions.
 *
 * Originally this showed every difficulty group at once, stacked on the
 * page. Restructured to a two-step flow, matching the reference: a picker
 * screen (Easy / Normal / Hard) first, and only after choosing one does its
 * question list appear. The animated background persists across both steps
 * rather than being re-mounted per step, so switching between "picking" and
 * "solving" feels like one continuous scene, not two different pages.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Award, ChevronRight, Flame, Zap } from "lucide-react";
import type { ChallengeDifficulty, ResolvedChallenge } from "@/content/schema";
import type { RoadmapTrack } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { useLocale, useT } from "@/i18n/use-t";
import { ChallengeCard } from "@/components/challenge-card";

// Three.js needs a real <canvas> and `window`, so it can only run in the
// browser -- and there is no reason for any other route to pay for this
// bundle, so it is loaded here, lazily, rather than mounted globally.
const PlexusBackground = dynamic(
  () => import("@/components/plexus-background").then((m) => m.PlexusBackground),
  { ssr: false },
);

const LEVELS: { key: ChallengeDifficulty; icon: typeof Zap; color: string }[] = [
  { key: "easy", icon: Zap, color: "var(--cleared)" },
  { key: "medium", icon: Flame, color: "var(--reward)" },
  { key: "hard", icon: Award, color: "var(--advanced)" },
];

export function ChallengesView({
  track,
  challenges,
}: {
  track: RoadmapTrack;
  challenges: ResolvedChallenge[];
}) {
  const t = useT();
  const locale = useLocale();
  const { solvedChallengeIds } = useProgress();
  const [level, setLevel] = useState<ChallengeDifficulty | null>(null);

  const solvedCount = challenges.filter((c) => solvedChallengeIds.has(c.id)).length;
  const inLevel = level ? challenges.filter((c) => c.difficulty === level) : [];

  return (
    <>
      <PlexusBackground />

      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-20 pt-8">
        <Link
          href={`/${locale}/track/${track.id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("challenges.backToTrack")}
        </Link>

        <header className="mb-6 text-center">
          <span
            className="inline-block rounded-md border px-2.5 py-1 font-robot text-[11px] font-bold tracking-[0.22em]"
            style={{
              borderColor: `${track.color}66`,
              background: `color-mix(in srgb, ${track.color} 12%, transparent)`,
              color: track.color,
            }}
          >
            {track.short}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-strong">
            {t("challenges.title")}
          </h1>
          {challenges.length > 0 && (
            <p className="mt-2 text-sm font-bold" style={{ color: track.color }}>
              {t("challenges.solvedCount")
                .replace("{solved}", String(solvedCount))
                .replace("{total}", String(challenges.length))}
            </p>
          )}
        </header>

        {challenges.length === 0 ? (
          <p className="panel rounded-2xl p-5 text-center text-sm text-muted">
            {t("challenges.noneYet")}
          </p>
        ) : level === null ? (
          <DifficultyPicker challenges={challenges} accent={track.color} onPick={setLevel} />
        ) : (
          <div>
            <button
              onClick={() => setLevel(null)}
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-faint underline decoration-2 underline-offset-2 transition hover:opacity-80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("challenges.changeDifficulty")}
            </button>
            <div className="space-y-2">
              {inLevel.map((c) => (
                <ChallengeCard key={c.id} trackId={track.id} challenge={c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * The difficulty-select screen: a glowing console with one row per level,
 * each showing how many of that level's challenges are already solved. A
 * level with nothing published yet is shown, greyed and inert, rather than
 * hidden -- consistent with how a locked track is shown rather than removed
 * elsewhere on the platform.
 */
function DifficultyPicker({
  challenges,
  accent,
  onPick,
}: {
  challenges: ResolvedChallenge[];
  accent: string;
  onPick: (level: ChallengeDifficulty) => void;
}) {
  const t = useT();
  const { solvedChallengeIds } = useProgress();

  return (
    <div
      className="panel panel-glow mx-auto max-w-md overflow-hidden rounded-3xl border p-6 text-center"
      style={{ borderColor: `${accent}55` }}
    >
      <span
        className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl"
        style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}
      >
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h2 className="text-lg font-extrabold text-strong">{t("challenges.pickTitle")}</h2>
      <p className="mt-1 text-sm text-muted">{t("challenges.pickSubtitle")}</p>

      <div className="mt-6 divide-y overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border)" }}>
        {LEVELS.map(({ key, icon: Icon, color }) => {
          const group = challenges.filter((c) => c.difficulty === key);
          const solved = group.filter((c) => solvedChallengeIds.has(c.id)).length;
          const empty = group.length === 0;

          return (
            <button
              key={key}
              type="button"
              disabled={empty}
              onClick={() => onPick(key)}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition disabled:cursor-not-allowed"
              style={{
                background: empty ? "var(--bg-2)" : "var(--surface)",
                opacity: empty ? 0.55 : 1,
              }}
              onMouseEnter={(e) => {
                if (!empty) e.currentTarget.style.background = `color-mix(in srgb, ${color} 10%, var(--surface))`;
              }}
              onMouseLeave={(e) => {
                if (!empty) e.currentTarget.style.background = "var(--surface)";
              }}
            >
              <Icon className="h-5 w-5 shrink-0" style={{ color: empty ? "var(--text-faint)" : color }} />
              <span
                className="flex-1 font-robot text-base font-black uppercase tracking-[0.15em]"
                style={{ color: empty ? "var(--text-faint)" : "var(--text-strong)" }}
              >
                {t(`challenges.${key}` as const)}
              </span>
              <span className="text-xs font-bold text-faint">
                {empty
                  ? t("challenges.rowEmpty")
                  : t("challenges.rowCount")
                      .replace("{solved}", String(solved))
                      .replace("{total}", String(group.length))}
              </span>
              {!empty && (
                <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--text-faint)" }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
