/**
 * Which lessons a learner may open, in one place.
 *
 * The rule is the map's and always has been: everything finished is cleared,
 * the first unfinished one is open, the rest are locked. What was missing is
 * that only the map obeyed it. The lesson page handed out a Next button
 * regardless, so the sequence the map enforced could be walked straight past
 * by pressing Next -- and the step bar's segments linked anywhere at all.
 *
 * Keeping the rule here means the three surfaces cannot drift apart, and
 * changing the rule is one edit rather than three.
 */
import type { Level, RoadmapTrack } from "@/content/roadmap-data";

export type LessonState = "completed" | "current" | "locked";

/** State for every lesson in order, keyed by lesson id. */
export function lessonStates(
  levels: Level[],
  completed: ReadonlySet<string>,
): Map<string, LessonState> {
  const out = new Map<string, LessonState>();
  let currentTaken = false;
  for (const level of levels) {
    if (completed.has(level.id)) {
      out.set(level.id, "completed");
    } else if (!currentTaken) {
      currentTaken = true;
      out.set(level.id, "current");
    } else {
      out.set(level.id, "locked");
    }
  }
  return out;
}

/** Re-state a whole track for one learner. */
export function withProgress(track: RoadmapTrack, completed: ReadonlySet<string>): RoadmapTrack {
  const states = lessonStates(track.levels, completed);
  return {
    ...track,
    levels: track.levels.map((level) => ({
      ...level,
      state: states.get(level.id) ?? "locked",
    })),
  };
}
