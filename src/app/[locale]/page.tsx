import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { getT, isLocale } from "@/i18n/messages";
import { trackProgress } from "@/content/roadmap-data";
import { getMainTracks } from "@/content/store";
import type { Locale } from "@/content/types";
import { RobotMascot } from "@/components/robot-mascot";
import { LearnerStrip } from "@/components/learner-strip";

/**
 * Home: pick your world.
 *
 * Same dark neon language as the mission map, so the site feels like one
 * product. Each track is a glowing "mission select" card that says in one
 * word what it is -- ROBOTICS / AI / GAMES -- before any reading happens.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);
  const trackList = await getMainTracks(locale);

  return (
    <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl flex-col justify-center px-4 py-10">
      {/* hero */}
      <section className="mb-10 grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="text-center md:text-left">
          <span className="inline-block rounded-md border px-2.5 py-1 font-robot text-[10px] font-bold tracking-[0.24em]"
            style={{ borderColor: "var(--border-strong)", background: "color-mix(in srgb, var(--neon) 12%, transparent)", color: "var(--neon)" }}>
            AXILEARN
          </span>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-strong sm:text-5xl">
            {t("home.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-muted md:mx-0">{t("home.subtitle")}</p>
        </div>
        <RobotMascot
          mood="happy"
          screenText={locale === "fr" ? "SALUT" : "HI THERE"}
          className="mx-auto h-44 w-44 md:h-56 md:w-56"
        />
      </section>

      <LearnerStrip tracks={trackList} />

      {/* mission select */}
      <section className="grid gap-5 md:grid-cols-3">
        {trackList.map((track) => {
          // "coming soon" is a content decision now, editable in the CMS.
          const locked = track.comingSoon === true || track.levels.length === 0;
          const pct = trackProgress(track);

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

              <span
                className="font-robot text-2xl font-black tracking-[0.18em]"
                style={{ color: locked ? "var(--text-faint)" : track.color }}
              >
                {track.short}
              </span>
              <h2 className="mt-2 text-lg font-bold text-strong">{track.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{track.description}</p>

              {locked ? (
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-muted"
                  style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
                  <Lock className="h-3 w-3" />
                  {t("home.comingSoon")}
                </span>
              ) : (
                <>
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: "color-mix(in srgb, var(--text) 14%, transparent)" }}>
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
            <div key={track.id} className="h-full opacity-70">
              {card}
            </div>
          ) : (
            <Link key={track.id} href={`/${locale}/track/${track.id}`} className="h-full">
              {card}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
