import { isLocale } from "@/i18n/messages";
import { getTracks } from "@/content/store";
import type { Locale } from "@/content/types";
import { ProfileView } from "@/components/profile-view";

/**
 * Profile route. Content is fetched here so the page can show real track and
 * lesson counts; who is looking (and therefore which of the two profiles they
 * see) is decided in the client view, where the auth session lives.
 */
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return <ProfileView tracks={await getTracks(locale)} />;
}
