/**
 * Who has earned a track's certificate, in one place.
 *
 * Four screens ask this question -- the home card's corner badge, the map's
 * capstone panel, the certificate page itself, and the profile's list -- and
 * until now each answered it with its own copy of the arithmetic. They agreed,
 * but only by coincidence: nothing stopped one of them from drifting and
 * offering a certificate the certificate page would then refuse to print.
 *
 * Eligibility is every lesson in the track, not a subset. There is no
 * optional-lesson concept on this platform, which is why the locked message
 * can say "the mandatory lessons" and mean all of them.
 */
import type { RoadmapTrack } from "@/content/roadmap-data";

export interface CertificateStatus {
  /** Lessons in the track. Zero means the track has no content yet. */
  total: number;
  done: number;
  remaining: number;
  /** True only at 100% of a track that actually has lessons. */
  earned: boolean;
}

export function certificateStatus(
  track: Pick<RoadmapTrack, "levels">,
  completedIds: ReadonlySet<string>,
): CertificateStatus {
  const total = track.levels.length;
  const done = track.levels.filter((l) => completedIds.has(l.id)).length;
  return { total, done, remaining: total - done, earned: total > 0 && done === total };
}
