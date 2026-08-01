/**
 * The shared discussion area.
 *
 * Reads are a live subscription rather than a fetch. A chat that only updates
 * when you reload is not a chat, and Firestore's onSnapshot costs no more
 * than the same query polled once -- it is the same listener the SDK already
 * maintains.
 *
 * Only the most recent messages are subscribed to. An unbounded listener on a
 * collection that grows forever gets slower every week it is used, and nobody
 * scrolls a year up a chat.
 */
import {
  addDoc,
  getDocs,
  writeBatch,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { DiscussionMessage } from "@/content/schema";

const COLLECTION = "discussion";
const WINDOW = 200;

/** How much of a quoted message is carried into the reply. */
const EXCERPT = 120;

export function excerptOf(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > EXCERPT ? `${flat.slice(0, EXCERPT)}…` : flat;
}

/**
 * Subscribe to the room. Returns the unsubscribe function.
 *
 * Ordered newest-first by the query because that is what `limit` needs to
 * mean "the latest 200", then reversed for display so the newest is at the
 * bottom where a chat expects it.
 */
export function watchDiscussion(
  onChange: (messages: DiscussionMessage[]) => void,
  onError: (err: Error) => void,
): () => void {
  return onSnapshot(
    query(collection(getDb(), COLLECTION), orderBy("at", "desc"), limit(WINDOW)),
    (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          uid: String(data.uid ?? ""),
          displayName: String(data.displayName ?? "Learner"),
          text: String(data.text ?? ""),
          at: Number(data.at ?? 0),
          ...(data.replyTo ? { replyTo: String(data.replyTo) } : {}),
          ...(data.replyToName ? { replyToName: String(data.replyToName) } : {}),
          ...(data.replyToExcerpt ? { replyToExcerpt: String(data.replyToExcerpt) } : {}),
        } satisfies DiscussionMessage;
      });
      onChange(list.reverse());
    },
    (err) => onError(err as Error),
  );
}

export async function postMessage(
  uid: string,
  displayName: string,
  text: string,
  replyTo?: DiscussionMessage,
): Promise<void> {
  await addDoc(collection(getDb(), COLLECTION), {
    uid,
    displayName,
    text: text.trim(),
    at: Date.now(),
    ...(replyTo
      ? {
          replyTo: replyTo.id,
          replyToName: replyTo.displayName,
          replyToExcerpt: excerptOf(replyTo.text),
        }
      : {}),
  });
}

/** Author or admin. The rule decides which; this just asks. */
export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTION, id));
}

/**
 * Stop an account posting. Admin-only, enforced by the users rule -- the
 * person blocked cannot clear the flag on themselves.
 */
export async function setBlocked(uid: string, blocked: boolean): Promise<void> {
  await updateDoc(doc(getDb(), "users", uid), { blocked });
}

/**
 * Empty the room. Admin only -- the rule allows an admin to delete any
 * message, and this is that, applied to all of them.
 *
 * Batched in chunks because Firestore caps a batch at 500 writes, and a room
 * that has been running a term will have more than that. Deleting one at a
 * time would work too and would take a minute of round trips.
 */
export async function clearDiscussion(): Promise<number> {
  const snap = await getDocs(collection(getDb(), COLLECTION));
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(getDb());
    for (const d of docs.slice(i, i + 400)) batch.delete(d.ref);
    await batch.commit();
  }
  return docs.length;
}
