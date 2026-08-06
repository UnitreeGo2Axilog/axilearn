"use client";

/**
 * Which robot-lab parts this learner has finished.
 *
 * Kept in Firestore, in the same `progress` collection as lessons, with the
 * part id in the lessonId field. That collection's rules already let a signed
 * -in learner write their own records, so this needs no rules deploy -- which
 * matters, because the rules written for homework and discussion are still
 * unpublished and anything depending on them would fail closed.
 *
 * It USED to be localStorage, which was fine while the lab was just practice.
 * It stopped being fine the moment the certificate depended on it: a
 * certificate backed by localStorage is forged by opening devtools, and is
 * lost by opening the site on a different computer. Something a learner shows
 * a teacher has to survive both.
 *
 * The cost of sharing the collection is that anything counting progress
 * records raw would count these as lessons. Two places did; both now filter
 * by the track's actual levels, which they arguably should have done anyway
 * (the roadmap one was already counting other tracks' lessons as its own).
 */
import { markLessonDone } from "@/lib/progress";

/** Part ids all start with this, which is what keeps them apart from lessons. */
export const LAB_PREFIX = "sp-";

export function isLabPartId(id: string): boolean {
  return id.startsWith(LAB_PREFIX);
}

/** Lesson ids only -- what a "lessons done" counter should ever see. */
export function lessonsOnly(ids: ReadonlySet<string>): Set<string> {
  return new Set([...ids].filter((id) => !isLabPartId(id)));
}

/**
 * Record a finished part. Idempotent: re-solving simply rewrites the record.
 * @param xp small on purpose -- the lab is not a way to farm levels.
 */
export async function markLabPartDone(
  uid: string,
  trackId: string,
  partId: string,
  xp = 40,
): Promise<void> {
  await markLessonDone(uid, trackId, partId, xp);
}

/**
 * Part n is open once part n-1 is done. The first is always open.
 * Same rule the lesson map uses, so the two feel like one platform.
 */
export function labStates(
  ids: string[],
  done: ReadonlySet<string>,
): Record<string, "done" | "open" | "locked"> {
  const out: Record<string, "done" | "open" | "locked"> = {};
  let openGiven = false;
  for (const id of ids) {
    if (done.has(id)) out[id] = "done";
    else if (!openGiven) {
      out[id] = "open";
      openGiven = true;
    } else out[id] = "locked";
  }
  return out;
}
