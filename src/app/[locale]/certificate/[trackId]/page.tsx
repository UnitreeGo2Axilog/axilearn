import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/messages";
import { getTrack } from "@/content/store";
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

  return (
    <AuthGate>
      <CertificateView track={track} />
    </AuthGate>
  );
}
