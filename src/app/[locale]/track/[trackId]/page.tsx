import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, Compass, Zap } from "lucide-react";
import { getT, isLocale } from "@/i18n/messages";
import { getChallenges, getTrack } from "@/content/store";
import type { Locale } from "@/content/types";
import { AuthGate } from "@/components/auth-gate";
import { TrackBriefing } from "@/components/track-briefing";

/**
 * Track briefing -- the page between choosing a world and entering its map.
 *
 * It answers the three questions a learner (or a parent) has before starting:
 * what will I actually be able to do, who is this for, and how do I not give
 * up? The Physical AI track additionally offers an OPTIONAL Python warm-up,
 * because that track needs a little code but we do not want to turn away
 * someone who has never programmed.
 */
export default async function TrackIntroPage({
  params,
}: {
  params: Promise<{ locale: string; trackId: string }>;
}) {
  const { locale: raw, trackId } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);

  const track = await getTrack(locale, trackId);
  if (!track) notFound();

  const { overview } = track;
  const totalXp = track.levels.reduce((sum, l) => sum + l.xpReward, 0);
  const totalMin = track.levels.reduce((sum, l) => sum + l.durationMinutes, 0);
  const sections = track.levels.filter((l) => l.section).length;
  const challengeCount = (await getChallenges(trackId, locale)).length;

  return (
    <AuthGate>
    <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-8">
      <Link
        href={`/${locale}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:opacity-80"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("track.back")}
      </Link>

      {/* --- headline ---------------------------------------------------- */}
      <header className="mb-8">
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
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-strong">{track.title}</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted">{overview.tagline}</p>

        {/* facts */}
        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { icon: BookOpen, label: `${track.levels.length} ${t("home.lessons")}` },
            { icon: Compass, label: `${sections} ${t("track.chapters")}` },
            { icon: Clock, label: `~${Math.round(totalMin / 60)} ${t("track.hours")}` },
            { icon: Zap, label: `${totalXp} XP` },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-main"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: track.color }} />
              {label}
            </span>
          ))}
        </div>
      </header>

      <TrackBriefing track={track} locale={locale} challengeCount={challengeCount} />
    </div>
    </AuthGate>
  );
}
