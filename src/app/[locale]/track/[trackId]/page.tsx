import { redirect } from "next/navigation";

/**
 * The per-track page is now the mission map, which carries its own track
 * switcher -- so this route just forwards there and stays as a stable link.
 */
export default async function TrackPage({
  params,
}: {
  params: Promise<{ locale: string; trackId: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/roadmap`);
}
