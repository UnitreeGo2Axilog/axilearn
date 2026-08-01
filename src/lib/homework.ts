/**
 * Assignments and the answers to them.
 *
 * The submission id is `{assignmentId}__{uid}`, which is what makes one
 * answer per learner per assignment a property of the database rather than
 * something the UI has to remember to check. The security rule requires the
 * id to match the uid inside it, so a learner cannot write into somebody
 * else's slot even by constructing the path by hand.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDocsFromServer,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { isLateAt, type AssignmentDoc, type SubmissionDoc } from "@/content/schema";

const ASSIGNMENTS = "assignments";
const SUBMISSIONS = "submissions";

export function submissionId(assignmentId: string, uid: string): string {
  return `${assignmentId}__${uid}`;
}

/* ---------------------------------------------------------- assignments */

/** Published work, for a learner. Filtered, because the rule reads `status`. */
export async function fetchAssignments(): Promise<AssignmentDoc[]> {
  const snap = await getDocs(
    query(collection(getDb(), ASSIGNMENTS), where("status", "==", "published")),
  );
  return snap.docs
    .map((d) => ({ ...(d.data() as AssignmentDoc), id: d.id }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Everything, drafts included -- the teacher's list. */
export async function listAssignments(): Promise<AssignmentDoc[]> {
  const snap = await getDocsFromServer(collection(getDb(), ASSIGNMENTS));
  return snap.docs
    .map((d) => ({ ...(d.data() as AssignmentDoc), id: d.id }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveAssignment(a: AssignmentDoc): Promise<void> {
  const { id, ...rest } = JSON.parse(JSON.stringify(a)) as AssignmentDoc;
  await setDoc(doc(getDb(), ASSIGNMENTS, id), { ...rest, updatedAt: Date.now() }, { merge: true });
}

export async function deleteAssignment(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), ASSIGNMENTS, id));
}

/* ---------------------------------------------------------- submissions */

/**
 * Hand work in.
 *
 * `late` is computed here from the assignment's own deadline, and then
 * checked again by the security rule against the server clock. Both matter:
 * this one so the learner is told the truth before they press the button, the
 * rule so the truth is not negotiable afterwards.
 */
export async function submitWork(
  assignment: AssignmentDoc,
  uid: string,
  displayName: string,
  code: string,
  note: string,
): Promise<void> {
  const at = Date.now();
  await setDoc(
    doc(getDb(), SUBMISSIONS, submissionId(assignment.id, uid)),
    {
      assignmentId: assignment.id,
      uid,
      displayName,
      code,
      note: note.trim(),
      submittedAt: at,
      late: isLateAt(assignment.dueAt, at),
      // `feedback` is deliberately NOT in this payload.
      //
      // The first version read the existing submission first, to carry the
      // teacher's reply through untouched. That read was the bug that broke
      // every FIRST submission: the read rule requires `resource != null`,
      // so reading a submission that does not exist yet is denied, the get
      // threw permission-denied, and the write never happened. Nobody could
      // ever hand in anything.
      //
      // Omitting the field does the same job without the read. This is a
      // merge, so a field that is not sent is left exactly as it was -- on a
      // resubmission the teacher's reply survives, and on a first submission
      // there is nothing to survive. The rule's keepsFeedback() check sees
      // the post-merge document, so it agrees either way.
    },
    { merge: true },
  );
}

export async function fetchMySubmissions(uid: string): Promise<SubmissionDoc[]> {
  const snap = await getDocs(query(collection(getDb(), SUBMISSIONS), where("uid", "==", uid)));
  return snap.docs.map((d) => ({ ...(d.data() as SubmissionDoc), id: d.id }));
}

/** Every answer to one assignment, for marking. */
export async function fetchSubmissionsFor(assignmentId: string): Promise<SubmissionDoc[]> {
  const snap = await getDocsFromServer(
    query(collection(getDb(), SUBMISSIONS), where("assignmentId", "==", assignmentId)),
  );
  return snap.docs
    .map((d) => ({ ...(d.data() as SubmissionDoc), id: d.id }))
    .sort((a, b) => a.submittedAt - b.submittedAt);
}

export async function giveFeedback(id: string, feedback: string): Promise<void> {
  await updateDoc(doc(getDb(), SUBMISSIONS, id), {
    feedback: feedback.trim(),
    reviewedAt: Date.now(),
  });
}
