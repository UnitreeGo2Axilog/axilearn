import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/messages";
import { getMainTracks, getTrack } from "@/content/store";
import type { Locale } from "@/content/types";
import { AuthGate } from "@/components/auth-gate";
import { RoadmapView } from "@/components/roadmap/roadmap-view";

/**
 * One track's mission map.
 *
 * The content is fetched here, on the server, so the map is drawn from the
 * first paint and Firestore is read at most once a minute however many
 * learners arrive. Everything interactive -- selecting a node, the mission
 * card, the toast -- lives in RoadmapView.
 */
export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ locale: string; trackId: string }>;
}) {
  const { locale: raw, trackId } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const [track, switcherTracks] = await Promise.all([
    getTrack(locale, trackId),
    getMainTracks(locale),
  ]);
  if (!track) notFound();

  return (
    <AuthGate>
      <RoadmapView track={track} switcherTracks={switcherTracks} />
    </AuthGate>
  );
}
