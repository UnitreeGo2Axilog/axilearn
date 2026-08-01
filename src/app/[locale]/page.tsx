import { getT, isLocale } from "@/i18n/messages";
import { getChallenges, getMainTracks } from "@/content/store";
import type { Locale } from "@/content/types";
import { RobotMascot } from "@/components/robot-mascot";
import { LearnerStrip } from "@/components/learner-strip";
import { TrackCard } from "@/components/track-card";
import { HomeSurface } from "@/components/home-surface";

/**
 * Home: pick your world.
 *
 * Same dark neon language as the mission map, so the site feels like one
 * product. Each track is a glowing "mission select" card that says in one
 * word what it is -- PYTHON / ROBOTICS / ML / GAMES -- before any reading
 * happens. Four of them now that Python is a track rather than a warm-up
 * tucked inside the robotics one, so the grid pairs up on a tablet instead of
 * leaving one card stranded on its own row.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);
  const trackList = await getMainTracks(locale);
  const challengeCounts = Object.fromEntries(
    await Promise.all(
      trackList.map(async (tr) => [tr.id, (await getChallenges(tr.id, locale)).length] as const),
    ),
  );

  return (
    <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl flex-col justify-center px-4 py-10">
      {/* hero */}
      <section className="mb-10 grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="text-center md:text-left">
          <span className="inline-block rounded-md border px-2.5 py-1 font-robot text-[10px] font-bold tracking-[0.24em]"
            style={{ borderColor: "var(--border-strong)", background: "color-mix(in srgb, var(--neon) 12%, transparent)", color: "var(--neon)" }}>
            AXILEARN
          </span>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-strong sm:text-5xl">
            {t("home.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-muted md:mx-0">{t("home.subtitle")}</p>
        </div>
        <RobotMascot
          mood="happy"
          screenText={locale === "fr" ? "SALUT" : "HI THERE"}
          className="mx-auto h-44 w-44 md:h-56 md:w-56"
        />
      </section>

      <LearnerStrip tracks={trackList} />

      {/* mission select -- for a student. An admin gets their two work
          surfaces instead, and these cards behind a preview switch. */}
      <HomeSurface>
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {trackList.map((track) => {
          // "coming soon" is a content decision now, editable in the CMS.
          const locked = track.comingSoon === true || track.levels.length === 0;
          return (
            <TrackCard
              key={track.id}
              track={track}
              locale={locale}
              locked={locked}
              challengeCount={challengeCounts[track.id] ?? 0}
            />
            );
          })}
        </section>
      </HomeSurface>
    </div>
  );
}
