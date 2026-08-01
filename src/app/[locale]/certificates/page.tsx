import { isLocale } from "@/i18n/messages";
import { getMainTracks } from "@/content/store";
import type { Locale } from "@/content/types";
import { AuthGate } from "@/components/auth-gate";
import { CertificatesView } from "@/components/certificates-view";

/**
 * Every certificate, earned or not. The single-track certificate page can
 * only ever answer "this one"; the account menu needed somewhere that answers
 * "all of them", including the ones still to come.
 */
export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const tracks = await getMainTracks(locale);

  return (
    <AuthGate>
      <CertificatesView tracks={tracks} />
    </AuthGate>
  );
}
