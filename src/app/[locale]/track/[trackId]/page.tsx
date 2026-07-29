import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getT, isLocale } from "@/i18n/messages";
import { LESSONS, MODULES, TRACKS } from "@/content/seed";
import { t as pick, type Locale } from "@/content/types";
import { JourneyMap } from "@/components/journey-map";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ locale: string; trackId: string }>;
}) {
  const { locale: raw, trackId } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);

  const track = TRACKS.find((x) => x.id === trackId);
  if (!track || track.status !== "active") notFound();

  const modules = MODULES.filter((m) => m.trackId === track.id).sort(
    (a, b) => a.order - b.order,
  );
  const lessons = LESSONS.filter((l) => l.trackId === track.id);
  const totalPoints = lessons.reduce((sum, l) => sum + l.points, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href={`/${locale}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("track.back")}
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold">{pick(track.title, locale)}</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">
          {pick(track.description, locale)}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          {lessons.length} {t("home.lessons")} · {totalPoints} {t("track.points")}
        </p>
      </div>

      {/* chapter legend */}
      <div className="mb-6 flex flex-wrap justify-center gap-3">
        {modules.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: m.color }}
            />
            {pick(m.title, locale)}
          </span>
        ))}
      </div>

      {/* Progress is loaded per-user in Phase 4; Phase 1 shows a fresh journey. */}
      <JourneyMap
        lessons={lessons}
        modules={modules}
        locale={locale}
        completed={[]}
        currentLessonId={null}
      />
    </div>
  );
}
