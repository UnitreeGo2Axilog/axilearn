"use client";

/**
 * Challenges for one track, grouped by difficulty -- exactly the grouping the
 * data model exists for. Each card tracks its own solved state via the shared
 * progress context, so the count at the top updates the moment one is solved,
 * with no page reload.
 */
import Link from "next/link";
import { ArrowLeft, Award, Flame, Zap } from "lucide-react";
import type { ResolvedChallenge } from "@/content/schema";
import type { RoadmapTrack } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { useLocale, useT } from "@/i18n/use-t";
import { ChallengeCard } from "@/components/challenge-card";

const GROUPS: { key: ResolvedChallenge["difficulty"]; icon: typeof Zap }[] = [
  { key: "easy", icon: Zap },
  { key: "medium", icon: Flame },
  { key: "hard", icon: Award },
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

  const solvedCount = challenges.filter((c) => solvedChallengeIds.has(c.id)).length;

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8">
      <Link
        href={`/${locale}/track/${track.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:opacity-80"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("challenges.backToTrack")}
      </Link>

      <header className="mb-6">
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
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          {t("challenges.subtitle")}
        </p>
        {challenges.length > 0 && (
          <p className="mt-3 text-sm font-bold" style={{ color: track.color }}>
            {t("challenges.solvedCount")
              .replace("{solved}", String(solvedCount))
              .replace("{total}", String(challenges.length))}
          </p>
        )}
      </header>

      {challenges.length === 0 ? (
        <p className="panel rounded-2xl p-5 text-sm text-muted">{t("challenges.noneYet")}</p>
      ) : (
        <div className="space-y-6">
          {GROUPS.map(({ key, icon: Icon }) => {
            const group = challenges.filter((c) => c.difficulty === key);
            if (group.length === 0) return null;
            return (
              <section key={key}>
                <h2 className="mb-2.5 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-faint">
                  <Icon className="h-4 w-4" />
                  {t(`challenges.${key}` as const)}
                </h2>
                <div className="space-y-2">
                  {group.map((c) => (
                    <ChallengeCard key={c.id} trackId={track.id} challenge={c} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
