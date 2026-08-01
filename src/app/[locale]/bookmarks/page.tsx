import { isLocale } from "@/i18n/messages";
import { getMainTracks } from "@/content/store";
import type { Locale } from "@/content/types";
import { AuthGate } from "@/components/auth-gate";
import { BookmarksView } from "@/components/bookmarks-view";

/**
 * Saved lessons. The tracks come from the server so a bookmark can be shown
 * with its real title and its track; which of them are saved is per-learner
 * and resolved on the client.
 */
export default async function BookmarksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const tracks = await getMainTracks(locale);

  return (
    <AuthGate>
      <BookmarksView tracks={tracks} />
    </AuthGate>
  );
}
