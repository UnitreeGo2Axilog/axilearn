import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/messages";
import { getChallenges, getTrack } from "@/content/store";
import type { Locale } from "@/content/types";
import { AuthGate } from "@/components/auth-gate";
import { ChallengesView } from "@/components/challenges-view";

/**
 * Challenges route. Content (the track and its published challenges) is
 * fetched here on the server; which ones are solved is per-learner, so
 * ChallengesView reads that from the shared progress context.
 */
export default async function ChallengesPage({
  params,
}: {
  params: Promise<{ locale: string; trackId: string }>;
}) {
  const { locale: raw, trackId } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const track = await getTrack(locale, trackId);
  if (!track) notFound();
  const challenges = await getChallenges(trackId, locale);

  return (
    <AuthGate>
      <ChallengesView track={track} challenges={challenges} />
    </AuthGate>
  );
}
