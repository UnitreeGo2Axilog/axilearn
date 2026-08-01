"use client";

/**
 * "My Progress": four numbers that are real, then one row per track.
 *
 * Four, not six. The obvious model for this page shows a grid of Lessons,
 * Exercises, Quizzes, Challenges, Exams -- and on a platform that has no
 * exercises, no separate quizzes and no exams, four of those six read zero
 * forever. A row of zeros does not say "you are early", it says "this is
 * broken". Every stat here counts something the platform actually records.
 *
 * There is no sort control either. It exists on sites with forty languages;
 * with four tracks it is furniture.
 */
import { LiveBackground } from "@/components/live-background";
import Link from "next/link";
import { Award, BookOpen, Flame, Swords, Zap } from "lucide-react";
import type { RoadmapTrack } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { certificateStatus } from "@/lib/certificate";
import { useLocale, useT } from "@/i18n/use-t";

export function ProgressView({ tracks }: { tracks: RoadmapTrack[] }) {
  const t = useT();
  const locale = useLocale();
  const { completedIds, countedChallengeIds, xp, level, into, span, streak } = useProgress();

  const lessonsDone = tracks.reduce(
    (n, tr) => n + tr.levels.filter((l) => completedIds.has(l.id)).length,
    0,
  );
  const certificates = tracks.filter((tr) => certificateStatus(tr, completedIds).earned).length;

  const stats = [
    { icon: Zap, label: t("progress.totalXp"), value: xp, tone: "var(--reward)" },
    { icon: BookOpen, label: t("progress.lessons"), value: lessonsDone, tone: "var(--neon)" },
    { icon: Swords, label: t("progress.challenges"), value: countedChallengeIds.size, tone: "var(--advanced)" },
    { icon: Award, label: t("progress.certificates"), value: certificates, tone: "var(--cleared)" },
  ];

  return (
    <>
      <LiveBackground />
    <div className="relative z-10 mx-auto max-w-4xl px-4 pb-20 pt-8">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-strong">{t("progress.title")}</h1>
        <p className="mt-1.5 text-sm text-muted">{t("progress.subtitle")}</p>
      </header>

      {/* level, because XP alone is a number without a scale */}
      <section className="panel mb-6 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-extrabold text-strong">
            {t("progress.level")} {level}
          </span>
          <span className="flex items-center gap-3">
            {/* The streak came off the home page with the strip. It is a real
                number the platform keeps, and the track advice tells learners
                to watch it, so it follows the rest of progress here rather
                than quietly disappearing. */}
            {streak > 0 && (
              <span
                className="inline-flex items-center gap-1 text-xs font-bold"
                style={{ color: "var(--reward)" }}
              >
                <Flame className="h-3.5 w-3.5" />
                {t("progress.streak").replace("{n}", String(streak))}
              </span>
            )}
            <span className="text-xs font-bold text-faint">
              {into} / {span} XP
            </span>
          </span>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full"
          style={{ background: "color-mix(in srgb, var(--text) 12%, transparent)" }}
        >
          <span
            className="block h-full rounded-full"
            style={{
              width: `${span ? Math.round((into / span) * 100) : 0}%`,
              background: "linear-gradient(90deg, var(--neon), var(--cleared))",
            }}
          />
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className="panel rounded-2xl p-4">
            <Icon className="h-4 w-4" style={{ color: tone }} />
            <p className="mt-2 text-2xl font-extrabold text-strong">{value}</p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-faint">{label}</p>
          </div>
        ))}
      </section>

      <h2 className="mb-3 text-lg font-extrabold text-strong">{t("progress.byTrack")}</h2>
      <div className="space-y-2.5">
        {tracks.map((track) => {
          const { total, done, earned } = certificateStatus(track, completedIds);
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <Link
              key={track.id}
              href={`/${locale}/track/${track.id}`}
              className="panel block rounded-2xl p-4 transition hover:opacity-90"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span
                  className="rounded-md px-2 py-0.5 font-robot text-[10px] font-bold tracking-[0.18em]"
                  style={{
                    background: `color-mix(in srgb, ${track.color} 16%, transparent)`,
                    color: track.color,
                  }}
                >
                  {track.short}
                </span>
                <span className="flex-1 truncate text-sm font-bold text-main">{track.title}</span>
                {earned && <Award className="h-4 w-4 shrink-0" style={{ color: "var(--reward)" }} />}
                <span className="shrink-0 text-xs font-bold" style={{ color: track.color }}>
                  {done}/{total} · {pct}%
                </span>
              </div>
              <div
                className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "color-mix(in srgb, var(--text) 12%, transparent)" }}
              >
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${pct}%`, background: track.color }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
    </>
  );
}
