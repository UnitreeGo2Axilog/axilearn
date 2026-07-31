/**
 * The curriculum that ships inside the repo, expressed as Firestore documents.
 *
 * It has two jobs:
 *
 *  - FALLBACK. If Firestore is empty, unreachable, or the env vars are missing,
 *    the site still shows a full curriculum instead of an empty map. Cloning
 *    the repo and running `npm run dev` works with no backend at all.
 *  - SEED. The admin "Import starter content" button writes exactly this into
 *    Firestore, which is why it lives in the stored shape rather than being
 *    converted twice.
 *
 * The strings are English only; French falls back to English until someone
 * translates a lesson in the CMS. The interface chrome is already bilingual --
 * this is the course text, which nobody has written in French yet.
 */
import { tracks } from "./roadmap-data";
import type { LessonEntry, TrackDoc } from "./schema";

/**
 * The repo data carries hand-authored `state` values so the prototype looked
 * lived-in. Stored content deliberately does not: progress belongs to the
 * learner, so state is derived at read time. Everything else maps across
 * directly.
 */
export const repoTrackDocs: TrackDoc[] = tracks.map((track, ti) => ({
  id: track.id,
  order: ti,
  status: "published",
  ...(track.hidden ? { hidden: true } : {}),
  ...(track.repoRevision ? { repoRevision: track.repoRevision } : {}),
  ...(track.comingSoon ? { comingSoon: true } : {}),
  short: track.short,
  color: track.color,
  glow: track.glow,
  icon: track.icon,
  title: { en: track.title },
  description: { en: track.description },
  overview: {
    tagline: { en: track.overview.tagline },
    forWho: { en: track.overview.forWho },
    outcomes: track.overview.outcomes.map((o) => ({ en: o })),
    advice: track.overview.advice.map((a) => ({ en: a })),
    ...(track.overview.primer
      ? {
          primer: {
            title: { en: track.overview.primer.title },
            why: { en: track.overview.primer.why },
            minutes: track.overview.primer.minutes,
            lessons: track.overview.primer.lessons.map((l) => ({ en: l })),
            trackId: "python-primer",
          },
        }
      : {}),
  },
  lessons: track.levels.map(
    (level, li): LessonEntry => ({
      id: level.id,
      order: li,
      status: "published",
      type: level.type,
      difficulty: level.difficulty,
      xpReward: level.xpReward,
      durationMinutes: level.durationMinutes,
      skills: level.skills,
      title: { en: level.title },
      shortDescription: { en: level.shortDescription },
      ...(level.badge ? { badge: level.badge } : {}),
      ...(level.section ? { section: level.section } : {}),
      ...(level.starterCode ? { starterCode: level.starterCode } : {}),
    }),
  ),
}));

export function repoTrackDoc(id: string): TrackDoc | undefined {
  return repoTrackDocs.find((t) => t.id === id);
}
