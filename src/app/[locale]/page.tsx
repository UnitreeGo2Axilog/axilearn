import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { getT, isLocale } from "@/i18n/messages";
import { tracks, trackProgress } from "@/content/roadmap-data";
import type { Locale } from "@/content/types";
import { RobotMascot } from "@/components/robot-mascot";

/**
 * Home: pick your world.
 *
 * Same dark neon language as the mission map, so the site feels like one
 * product. Each track is a glowing "mission select" card that says in one
 * word what it is -- ROBOTICS / AI / GAMES -- before any reading happens.
 */
const COMING_SOON = new Set(["python-ai", "game-dev"]);

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);

  return (
    <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl flex-col justify-center px-4 py-10">
      {/* hero */}
      <section className="mb-10 grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="text-center md:text-left">
          <span className="inline-block rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 font-robot text-[10px] font-bold tracking-[0.24em] text-cyan-300">
            AXILEARN
          </span>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-5xl">
            {t("home.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-400 md:mx-0">{t("home.subtitle")}</p>
        </div>
        <RobotMascot
          mood="happy"
          screenText={locale === "fr" ? "SALUT" : "HI THERE"}
          className="mx-auto h-44 w-44 md:h-56 md:w-56"
        />
      </section>

      {/* mission select */}
      <section className="grid gap-5 md:grid-cols-3">
        {tracks.map((track) => {
          const locked = COMING_SOON.has(track.id);
          const pct = trackProgress(track);

          const card = (
            <div
              className="group relative h-full overflow-hidden rounded-2xl border p-5 transition"
              style={{
                borderColor: locked ? "rgba(148,163,184,0.18)" : `${track.color}55`,
                background: "rgba(10,16,32,0.7)",
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
                style={{ color: locked ? "#475569" : track.color }}
              >
                {track.short}
              </span>
              <h2 className="mt-2 text-lg font-bold text-slate-100">{track.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{track.description}</p>

              {locked ? (
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-600/40 bg-slate-700/20 px-3 py-1.5 text-xs font-bold text-slate-400">
                  <Lock className="h-3 w-3" />
                  {t("home.comingSoon")}
                </span>
              ) : (
                <>
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${pct}%`, background: track.color, boxShadow: `0 0 10px ${track.color}` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      {track.levels.length} {t("home.lessons")} · {pct}%
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wide transition group-hover:gap-2.5"
                      style={{ background: track.color, color: "#04121a" }}
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
            <Link key={track.id} href={`/${locale}/roadmap`} className="h-full">
              {card}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
