/**
 * Reading and writing the notification collection.
 *
 * Learner-side reads are a FILTERED query, not a bare collection listing. The
 * security rule inspects `status`, and Firestore rules are not filters: a
 * query that does not already constrain a field the rule reads is rejected
 * outright rather than quietly returning less. Asking for every notification
 * and filtering in JavaScript would fail with permission-denied, not with a
 * short list.
 *
 * Which ones a learner has opened lives on their own user document, the same
 * place as bookmarks and for the same reasons: it is per-learner, it is read
 * all at once, and the existing owner-update rule already allows it, so it
 * needs no new collection and no new rules.
 */
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { repoNotifications } from "@/content/notifications";
import type { NotificationDoc } from "@/content/schema";

const COLLECTION = "notifications";

/** Published messages, for a signed-in learner. */
export async function fetchNotifications(): Promise<NotificationDoc[]> {
  const snap = await getDocs(
    query(collection(getDb(), COLLECTION), where("status", "==", "published")),
  );
  if (snap.empty) return repoNotifications; // nothing imported yet
  return snap.docs.map((d) => ({ ...(d.data() as NotificationDoc), id: d.id }));
}

/** Everything, drafts included -- the CMS list. */
export async function listNotifications(): Promise<NotificationDoc[]> {
  const snap = await getDocsFromServer(collection(getDb(), COLLECTION));
  return snap.docs
    .map((d) => ({ ...(d.data() as NotificationDoc), id: d.id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function readNotification(id: string): Promise<NotificationDoc | null> {
  const snap = await getDoc(doc(getDb(), COLLECTION, id));
  return snap.exists() ? { ...(snap.data() as NotificationDoc), id: snap.id } : null;
}

export async function saveNotification(n: NotificationDoc): Promise<void> {
  const { id, ...rest } = JSON.parse(JSON.stringify(n)) as NotificationDoc;
  const { setDoc } = await import("firebase/firestore");
  await setDoc(doc(getDb(), COLLECTION, id), { ...rest, updatedAt: Date.now() }, { merge: true });
}

export async function deleteNotification(id: string): Promise<void> {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(getDb(), COLLECTION, id));
}

/* ------------------------------------------------------------ read state */

export async function fetchReadNotificationIds(uid: string): Promise<string[]> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  const raw = snap.exists() ? (snap.data() as { readNotifications?: unknown }).readNotifications : null;
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : [];
}

/** arrayUnion, so two open tabs cannot erase each other's reads. */
export async function markNotificationsRead(uid: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await updateDoc(doc(getDb(), "users", uid), { readNotifications: arrayUnion(...ids) });
}

/* ------------------------------------------------------------- dismissed */

/**
 * Removing a notification hides it from ONE person's bell. It does not touch
 * the message itself, which belongs to whoever wrote it and is still on
 * everybody else's bell -- a learner cannot delete a tip out from under the
 * rest of the class, and an admin who wants one gone for good deletes it in
 * the CMS instead.
 *
 * There is no undo, which is the honest reading of "remove". Nothing is lost
 * that cannot be republished.
 */
export async function fetchDismissedNotificationIds(uid: string): Promise<string[]> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  const raw = snap.exists()
    ? (snap.data() as { dismissedNotifications?: unknown }).dismissedNotifications
    : null;
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : [];
}

export async function dismissNotifications(uid: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await updateDoc(doc(getDb(), "users", uid), { dismissedNotifications: arrayUnion(...ids) });
}
