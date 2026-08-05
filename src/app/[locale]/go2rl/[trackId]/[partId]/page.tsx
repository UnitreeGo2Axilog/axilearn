import { notFound } from "next/navigation";
import { getT, isLocale } from "@/i18n/messages";
import { getTrack } from "@/content/store";
import type { Locale } from "@/content/types";
import { SIM_PARTS } from "@/content/sim-parts";
import { AuthGate } from "@/components/auth-gate";
import { Go2RlPartView } from "@/components/go2rl-part-view";

/**
 * One part of the lab, on its own.
 *
 * Split out of the stacked page because three notebooks together meant three
 * simulators booting at once and a learner scrolling past two robots to reach
 * the one they wanted. One part, one robot, one thing to do.
 */
export default async function Go2RlPartPage({
  params,
}: {
  params: Promise<{ locale: string; trackId: string; partId: string }>;
}) {
  const { locale: raw, trackId, partId } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);

  const track = await getTrack(locale, trackId);
  if (!track) notFound();

  const parts = SIM_PARTS.filter((p) => track.levels.some((l) => l.id === p.lessonId));
  const index = parts.findIndex((p) => p.id === partId);
  if (index < 0) notFound();

  return (
    <AuthGate>
      <Go2RlPartView
        part={parts[index]}
        next={parts[index + 1] ?? null}
        index={index}
        total={parts.length}
        locale={locale}
        trackId={track.id}
        accent={track.color}
        labels={{
          back: t("go2rl.backToMap"),
          step: t("go2rl.step"),
          next: t("go2rl.next"),
          finished: t("go2rl.finished"),
          finishedBody: t("go2rl.finishedBody"),
        }}
      />
    </AuthGate>
  );
}
