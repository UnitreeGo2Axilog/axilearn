/**
 * Who has earned a track's certificate, in one place.
 *
 * Four screens ask this question -- the home card's corner badge, the map's
 * capstone panel, the certificate page itself, and the profile's list -- and
 * until now each answered it with its own copy of the arithmetic. They agreed,
 * but only by coincidence: nothing stopped one of them from drifting and
 * offering a certificate the certificate page would then refuse to print.
 *
 * Eligibility is every lesson in the track, not a subset -- there is no
 * optional-lesson concept here, which is why the locked message can say "the
 * mandatory lessons" and mean all of them.
 *
 * AND, where a track has one, its final exam. Reading nine chapters and
 * pressing "mark as done" nine times is a weak claim to put on a certificate
 * somebody shows a teacher; one exam that uses all nine at once is a real
 * one. A track with no exam keeps the old rule exactly.
 */
import type { RoadmapTrack } from "@/content/roadmap-data";
import { SIM_PARTS } from "@/content/sim-parts";

/**
 * The lab parts belonging to a track, found through their lessons.
 *
 * Resolved here rather than passed in by nine callers: a certificate that
 * different screens disagree about is worse than no certificate, and the only
 * way nine call sites stay in step is by not making them each remember.
 */
export function labPartIdsFor(track: Pick<RoadmapTrack, "levels">): string[] {
  return SIM_PARTS.filter((p) => track.levels.some((l) => l.id === p.lessonId)).map((p) => p.id);
}

export interface CertificateStatus {
  /** Lessons in the track. Zero means the track has no content yet. */
  total: number;
  done: number;
  remaining: number;
  /** Every lesson read and marked done. */
  lessonsComplete: boolean;
  /** This track has a final exam standing between the lessons and the paper. */
  examRequired: boolean;
  examDone: boolean;
  /** Everything: the lessons, and the exam when there is one. */
  earned: boolean;
}

/**
 * @param exam  The track's final exam, when the caller knows about it. Left
 *              out, the answer is lessons-only -- which is what it was before
 *              exams existed, and what a caller that has not loaded the
 *              challenges should say rather than guessing.
 */
export function certificateStatus(
  track: Pick<RoadmapTrack, "levels">,
  completedIds: ReadonlySet<string>,
  exam?: { id: string; solved: boolean } | null,
  /**
   * Robot-lab part ids for this track, when it has any.
   *
   * A track with a lab has to be finished BOTH ways: every lesson read and
   * every part of the robot lab solved. The lab alone would certify somebody
   * who never read a page, and the lessons alone would certify somebody who
   * never made a robot move; neither is the claim this certificate makes.
   */
  labPartIds?: readonly string[],
): CertificateStatus {
  const lab = labPartIds ?? labPartIdsFor(track);
  if (lab.length > 0) {
    // Counted together so the progress a learner sees ("7 / 14") is the whole
    // job, not two separate bars that each claim to be the requirement.
    const lessons = track.levels.length;
    const lessonsDone = track.levels.filter((l) => completedIds.has(l.id)).length;
    const labDone = lab.filter((id) => completedIds.has(id)).length;
    const total = lessons + lab.length;
    const done = lessonsDone + labDone;
    return {
      total,
      done,
      remaining: total - done,
      lessonsComplete: lessonsDone === lessons,
      examRequired: false,
      examDone: false,
      earned: lessonsDone === lessons && labDone === lab.length,
    };
  }

  const total = track.levels.length;
  const done = track.levels.filter((l) => completedIds.has(l.id)).length;
  const lessonsComplete = total > 0 && done === total;
  const examRequired = Boolean(exam);
  const examDone = exam ? exam.solved : false;
  return {
    total,
    done,
    remaining: total - done,
    lessonsComplete,
    examRequired,
    examDone,
    earned: lessonsComplete && (!examRequired || examDone),
  };
}
