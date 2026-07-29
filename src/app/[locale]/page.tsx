import Link from "next/link";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { getT, isLocale } from "@/i18n/messages";
import { LESSONS, TRACKS } from "@/content/seed";
import { t as pick, type Locale } from "@/content/types";
import { RobotMascot } from "@/components/robot-mascot";

/**
 * Home. The three tracks are the whole message, so each card leads with a huge
 * emoji and a one-word label -- ROBOTICS / AI / GAMES -- so a visitor knows in
 * one second what this site teaches, before reading anything.
 */
const LOOK: Record<
  string,
  { emoji: string; word: { en: string; fr: string }; from: string; to: string }
> = {
  "physical-ai": {
    emoji: "🤖",
    word: { en: "ROBOTICS", fr: "ROBOTIQUE" },
    from: "from-orange-400",
    to: "to-amber-500",
  },
  "ml-ai": {
    emoji: "🧠",
    word: { en: "AI", fr: "IA" },
    from: "from-violet-500",
    to: "to-fuchsia-500",
  },
  "game-dev": {
    emoji: "🎮",
    word: { en: "GAMES", fr: "JEUX" },
    from: "from-cyan-400",
    to: "to-sky-500",
  },
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      {/* hero */}
      <section className="mb-10 grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-bold text-orange-600 shadow-sm">
            <Sparkles className="h-4 w-4" />
            {t("app.name")}
          </span>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {t("home.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-600 md:mx-0">
            {t("home.subtitle")}
          </p>
        </div>
        <RobotMascot
          mood="happy"
          screenText={locale === "fr" ? "SALUT" : "HI THERE"}
          className="mx-auto h-44 w-44 md:h-56 md:w-56"
        />
      </section>

      {/* the three worlds */}
      <section className="grid gap-6 md:grid-cols-3">
        {TRACKS.map((track) => {
          const look = LOOK[track.id];
          const count = LESSONS.filter((l) => l.trackId === track.id).length;
          const active = track.status === "active";

          const card = (
            <div
              className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-white bg-white shadow-chunky transition ${
                active ? "hover:-translate-y-1.5" : "opacity-75 grayscale-[35%]"
              }`}
            >
              {/* big coloured header = the instant "what is this" */}
              <div
                className={`relative flex flex-col items-center bg-gradient-to-br ${look.from} ${look.to} px-6 py-8 text-white`}
              >
                <span className="text-6xl drop-shadow-md">{look.emoji}</span>
                <span className="mt-2 text-2xl font-extrabold tracking-widest">
                  {look.word[locale]}
                </span>
                {!active && (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-xs font-bold">
                    <Lock className="h-3 w-3" />
                    {t("home.comingSoon")}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-extrabold">{pick(track.title, locale)}</h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">
                  {pick(track.description, locale)}
                </p>

                {active && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {count} {t("home.lessons")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-extrabold text-white transition group-hover:gap-2.5">
                      {t("home.start")}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          );

          return active ? (
            <Link key={track.id} href={`/${locale}/track/${track.id}`} className="h-full">
              {card}
            </Link>
          ) : (
            <div key={track.id} className="h-full">
              {card}
            </div>
          );
        })}
      </section>
    </div>
  );
}
