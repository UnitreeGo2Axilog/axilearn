import Link from "next/link";
import { ArrowRight, Bot, Brain, Gamepad2, Lock } from "lucide-react";
import { getT, isLocale } from "@/i18n/messages";
import { LESSONS, TRACKS } from "@/content/seed";
import { t as pick, type Locale } from "@/content/types";

const ICONS = { Bot, Brain, Gamepad2 } as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t("home.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
          {t("home.subtitle")}
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TRACKS.map((track) => {
          const Icon = ICONS[track.icon as keyof typeof ICONS] ?? Bot;
          const count = LESSONS.filter((l) => l.trackId === track.id).length;
          const active = track.status === "active";

          const card = (
            <div
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition ${
                active
                  ? "border-slate-200 hover:-translate-y-1 hover:shadow-lg"
                  : "border-slate-200 opacity-70"
              }`}
            >
              <div
                className="mb-4 grid h-12 w-12 place-items-center rounded-xl text-white"
                style={{ backgroundColor: track.color }}
              >
                <Icon className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-bold">{pick(track.title, locale)}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {pick(track.description, locale)}
              </p>

              <div className="mt-5 flex items-center justify-between">
                {active ? (
                  <>
                    <span className="text-sm text-slate-500">
                      {count} {t("home.lessons")}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: track.color }}
                    >
                      {t("home.start")}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    <Lock className="h-3 w-3" />
                    {t("home.comingSoon")}
                  </span>
                )}
              </div>
            </div>
          );

          return active ? (
            <Link key={track.id} href={`/${locale}/track/${track.id}`}>
              {card}
            </Link>
          ) : (
            <div key={track.id}>{card}</div>
          );
        })}
      </section>
    </div>
  );
}
