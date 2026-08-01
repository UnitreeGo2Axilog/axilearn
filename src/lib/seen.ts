/**
 * "What had I already seen last time I looked?"
 *
 * One timestamp per area, on the learner's own user document -- the same
 * place as bookmarks and read notifications, so no new collection and no new
 * rules. A dot is the cheapest possible unread signal: it does not need a
 * count, only an answer to "is there anything newer than the last time I was
 * here", which one number settles.
 *
 * Deliberately NOT the same thing as the bell. The bell reports items
 * addressed to you; these dots report activity in a shared place. A room with
 * forty new messages nobody wrote to you specifically should nudge, not
 * announce forty things.
 */
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export type SeenArea = "discussion" | "homework";

const FIELD: Record<SeenArea, string> = {
  discussion: "seenDiscussionAt",
  homework: "seenHomeworkAt",
};

export async function fetchSeen(uid: string): Promise<Record<SeenArea, number>> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  const data = snap.exists() ? (snap.data() as Record<string, unknown>) : {};
  const read = (k: string) => (typeof data[k] === "number" ? (data[k] as number) : 0);
  return { discussion: read(FIELD.discussion), homework: read(FIELD.homework) };
}

/** Merge, so this never touches role, bookmarks or anything else there. */
export async function markSeen(uid: string, area: SeenArea, at: number): Promise<void> {
  await setDoc(doc(getDb(), "users", uid), { [FIELD[area]]: at }, { merge: true });
}
