import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Lightbulb,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { getT, isLocale } from "@/i18n/messages";
import { getTrack } from "@/content/store";
import type { Locale } from "@/content/types";
import { AuthGate } from "@/components/auth-gate";
import { TrackCta } from "@/components/track-cta";

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

      {/* --- who it is for ---------------------------------------------- */}
      <section
        className="mb-8 flex items-start gap-3 rounded-2xl border p-4"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <Users className="mt-0.5 h-5 w-5 shrink-0" style={{ color: track.color }} />
        <p className="text-sm leading-relaxed text-main">{overview.forWho}</p>
      </section>

      {/* --- what you'll learn ------------------------------------------ */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-strong">
          <Sparkles className="h-5 w-5" style={{ color: track.color }} />
          {t("track.whatYouLearn")}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {overview.outcomes.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 rounded-xl border p-3.5 text-sm leading-relaxed text-main"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: "var(--cleared)" }}
              />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* --- optional primer (Physical AI) ----------------------------- */}
      {overview.primer && (
        <section
          className="mb-8 overflow-hidden rounded-2xl border"
          style={{
            borderColor: "color-mix(in srgb, var(--advanced) 45%, transparent)",
            background: "color-mix(in srgb, var(--advanced) 8%, var(--surface))",
          }}
        >
          <div className="p-5">
            <span
              className="inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
              style={{
                background: "color-mix(in srgb, var(--advanced) 18%, transparent)",
                color: "var(--advanced)",
              }}
            >
              {t("track.optional")}
            </span>
            <h2 className="mt-2.5 text-lg font-extrabold text-strong">{overview.primer.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{overview.primer.why}</p>

            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {overview.primer.lessons.map((lesson, i) => (
                <li key={lesson} className="flex items-center gap-2.5 text-sm text-main">
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-black"
                    style={{
                      background: "color-mix(in srgb, var(--advanced) 16%, transparent)",
                      color: "var(--advanced)",
                    }}
                  >
                    {i + 1}
                  </span>
                  {lesson}
                </li>
              ))}
            </ol>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/roadmap/python-primer`}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black"
                style={{ background: "var(--advanced)", color: "var(--surface-solid)" }}
              >
                {t("track.takePrimer")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-faint">
                <Clock className="h-3.5 w-3.5" />~{overview.primer.minutes} min
              </span>
            </div>
          </div>
        </section>
      )}

      {/* --- advice ----------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-strong">
          <Lightbulb className="h-5 w-5" style={{ color: "var(--reward)" }} />
          {t("track.howToSucceed")}
        </h2>
        <ul className="space-y-2.5">
          {overview.advice.map((tip, i) => (
            <li
              key={tip}
              className="flex items-start gap-3 rounded-xl border p-3.5 text-sm leading-relaxed text-main"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-black"
                style={{
                  background: "color-mix(in srgb, var(--reward) 16%, transparent)",
                  color: "var(--reward)",
                }}
              >
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* --- enter the map --------------------------------------------- */}
      <TrackCta track={track} locale={locale} />
    </div>
    </AuthGate>
  );
}
