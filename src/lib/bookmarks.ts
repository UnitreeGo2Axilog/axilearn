/**
 * Saved lessons -- a learner's own "come back to this".
 *
 * Stored as an array on the user document rather than as a collection of its
 * own. A learner has tens of these, not thousands; they are always read all
 * at once (the menu badge, the bookmarks page) and never queried across
 * users. A subcollection would mean one document per bookmark, a query per
 * page, and a new block of security rules -- for a list that comfortably fits
 * in a field. The existing rule already lets an owner update their own user
 * document, so this needed no rules change at all.
 *
 * arrayUnion/arrayRemove rather than read-modify-write: the same learner with
 * two tabs open would otherwise have one tab's save silently erase the
 * other's, and this is a field people edit casually and often.
 */
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export async function fetchBookmarks(uid: string): Promise<string[]> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  const raw = snap.exists() ? (snap.data() as { bookmarks?: unknown }).bookmarks : null;
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : [];
}

export async function addBookmark(uid: string, lessonId: string): Promise<void> {
  await updateDoc(doc(getDb(), "users", uid), { bookmarks: arrayUnion(lessonId) });
}

export async function removeBookmark(uid: string, lessonId: string): Promise<void> {
  await updateDoc(doc(getDb(), "users", uid), { bookmarks: arrayRemove(lessonId) });
}
