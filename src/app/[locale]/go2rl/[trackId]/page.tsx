import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getT, isLocale } from "@/i18n/messages";
import { getTrack } from "@/content/store";
import type { Locale } from "@/content/types";
import { SIM_PARTS } from "@/content/sim-parts";
import { AuthGate } from "@/components/auth-gate";
import { Go2RlLab } from "@/components/go2rl-lab";

/**
 * The robot lab: a mini project sitting beside the course and the challenges,
 * not inside a lesson.
 *
 * That separation is the point. Reading a chapter and building something are
 * different acts, and a learner should be able to choose the second on
 * purpose rather than trip over it halfway down a page of prose. The track
 * page now offers three doors -- read, practise, build -- and this is the
 * third.
 */
export default async function Go2RlPage({
  params,
}: {
  params: Promise<{ locale: string; trackId: string }>;
}) {
  const { locale: raw, trackId } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);

  const track = await getTrack(locale, trackId);
  if (!track) notFound();

  // Parts belong to lessons; a track's parts are the ones whose lesson is in
  // it. Keeps the content file free of track ids it would only duplicate.
  const parts = SIM_PARTS.filter((p) => track.levels.some((l) => l.id === p.lessonId));
  if (parts.length === 0) notFound();

  return (
    <AuthGate>
      <Go2RlLab
        parts={parts}
        locale={locale}
        trackId={track.id}
        accent={track.color}
        header={
          <>
            <Link
              href={`/${locale}/track/${track.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:opacity-80"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("go2rl.back")}
            </Link>
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <h1 className="font-robot text-3xl font-black tracking-tight" style={{ color: track.color }}>
                {t("go2rl.title")}
              </h1>
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-faint">
                {t("go2rl.subtitle")}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{t("go2rl.intro")}</p>
            <p className="mt-1 max-w-2xl text-xs text-faint">{t("go2rl.firstLoad")}</p>
          </>
        }
      />
    </AuthGate>
  );
}
