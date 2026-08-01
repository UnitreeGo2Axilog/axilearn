import { isLocale } from "@/i18n/messages";
import { getMainTracks } from "@/content/store";
import type { Locale } from "@/content/types";
import { AuthGate } from "@/components/auth-gate";
import { ProgressView } from "@/components/progress-view";

/**
 * Progress lives on its own page now rather than as a strip above the tracks.
 * The home page is for choosing what to do next; this is for looking back at
 * what you have done, and the two want different amounts of room.
 */
export default async function ProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const tracks = await getMainTracks(locale);

  return (
    <AuthGate>
      <ProgressView tracks={tracks} />
    </AuthGate>
  );
}
