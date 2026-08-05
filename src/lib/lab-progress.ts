"use client";

/**
 * Which robot-lab parts this learner has finished.
 *
 * Kept in the browser, not Firestore, and that is a considered choice rather
 * than a shortcut:
 *
 *  - The obvious reuse -- markLessonDone with the part id -- would land these
 *    in the same collection as lessons, and two places count that collection
 *    raw (the profile's "lessons done" tile and the roadmap header). Finishing
 *    three robot parts would silently claim three lessons the learner never
 *    read.
 *  - A separate collection needs a firestore.rules change, and the rules
 *    already written are still unpublished. Shipping something that fails
 *    closed until an unrelated deploy happens is worse than shipping
 *    something that works now.
 *
 * The cost is honest and small: progress does not follow a learner to another
 * device, and clearing site data forgets it. Nothing here is graded, and the
 * lab can be replayed freely, so the only thing lost is which doors are open.
 * Moving it to Firestore later is a swap of these two functions.
 */
const KEY = "axi.lab.done";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function labDone(): Set<string> {
  return read();
}

export function markLabPartDone(partId: string): Set<string> {
  const s = read();
  s.add(partId);
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    /* private mode, quota -- the lab still works, it just forgets */
  }
  return s;
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
