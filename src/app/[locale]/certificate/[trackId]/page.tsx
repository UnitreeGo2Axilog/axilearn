import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/messages";
import { getChallenges, getTrack } from "@/content/store";
import type { Locale } from "@/content/types";
import { AuthGate } from "@/components/auth-gate";
import { CertificateView } from "@/components/certificate-view";

/**
 * Certificate route. Content (the track) is fetched here; eligibility is
 * per-learner, so CertificateView checks it client-side against their own
 * progress and shows the locked state itself if they arrive without having
 * finished the track.
 */
export default async function CertificatePage({
  params,
}: {
  params: Promise<{ locale: string; trackId: string }>;
}) {
  const { locale: raw, trackId } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const track = await getTrack(locale, trackId);
  if (!track) notFound();

  // The exam is content, so it is loaded here; whether THIS learner has
  // solved it is per-person and checked in the view.
  const examId = (await getChallenges(trackId, locale)).find((c) => c.isExam)?.id;

  return (
    <AuthGate>
      <CertificateView track={track} examId={examId} />
    </AuthGate>
  );
}
