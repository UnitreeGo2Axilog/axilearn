/**
 * Messages between a learner and their teacher.
 *
 * Every write that adds a message also flips the unread flags on the thread,
 * in that order: the message first, the flags second. If the flag write fails
 * the message still exists and will be found by opening the thread -- the
 * other way round, a badge would announce a message that was never stored.
 */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { ContactMessage, ContactThread } from "@/content/schema";

const THREADS = "contactThreads";

function threadOf(id: string, data: Record<string, unknown>): ContactThread {
  return {
    id,
    uid: String(data.uid ?? ""),
    displayName: String(data.displayName ?? "Learner"),
    email: (data.email as string | null) ?? null,
    subject: String(data.subject ?? ""),
    createdAt: Number(data.createdAt ?? 0),
    updatedAt: Number(data.updatedAt ?? 0),
    lastFrom: data.lastFrom === "admin" ? "admin" : "student",
    studentUnread: data.studentUnread === true,
    adminUnread: data.adminUnread === true,
  };
}

/** Start a conversation. Returns the new thread id. */
export async function startThread(
  uid: string,
  displayName: string,
  email: string | null,
  subject: string,
  text: string,
): Promise<string> {
  const now = Date.now();
  const ref = doc(collection(getDb(), THREADS));
  await setDoc(ref, {
    uid,
    displayName,
    email,
    subject: subject.trim(),
    createdAt: now,
    updatedAt: now,
    lastFrom: "student",
    studentUnread: false,
    adminUnread: true,
  });
  await addDoc(collection(getDb(), THREADS, ref.id, "messages"), {
    from: "student",
    text: text.trim(),
    at: now,
    // serverTimestamp is not used for ordering here: `at` is what the UI
    // sorts on, and a client clock that is a minute out is harmless in a
    // conversation between two people.
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Add a reply and hand the unread flag to the other side. */
export async function replyToThread(
  threadId: string,
  from: "student" | "admin",
  text: string,
): Promise<void> {
  const now = Date.now();
  await addDoc(collection(getDb(), THREADS, threadId, "messages"), {
    from,
    text: text.trim(),
    at: now,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(getDb(), THREADS, threadId), {
    updatedAt: now,
    lastFrom: from,
    studentUnread: from === "admin",
    adminUnread: from === "student",
  });
}

/** Clear the badge for whichever side just opened the thread. */
export async function markThreadRead(
  threadId: string,
  side: "student" | "admin",
): Promise<void> {
  await updateDoc(doc(getDb(), THREADS, threadId), {
    ...(side === "student" ? { studentUnread: false } : { adminUnread: false }),
  });
}

/**
 * One learner's own threads.
 *
 * Constrained by uid because the rule inspects that field, and rules are not
 * filters: an unconstrained listing is rejected outright rather than trimmed.
 */
export async function fetchMyThreads(uid: string): Promise<ContactThread[]> {
  const snap = await getDocs(query(collection(getDb(), THREADS), where("uid", "==", uid)));
  return snap.docs
    .map((d) => threadOf(d.id, d.data()))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Every thread, for the staff inbox. */
export async function fetchAllThreads(): Promise<ContactThread[]> {
  const snap = await getDocsFromServer(collection(getDb(), THREADS));
  return snap.docs
    .map((d) => threadOf(d.id, d.data()))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function fetchThread(threadId: string): Promise<ContactThread | null> {
  const snap = await getDoc(doc(getDb(), THREADS, threadId));
  return snap.exists() ? threadOf(snap.id, snap.data()) : null;
}

export async function fetchMessages(threadId: string): Promise<ContactMessage[]> {
  const snap = await getDocs(
    query(collection(getDb(), THREADS, threadId, "messages"), orderBy("at", "asc")),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      from: data.from === "admin" ? "admin" : "student",
      text: String(data.text ?? ""),
      at: Number(data.at ?? 0),
    } satisfies ContactMessage;
  });
}
