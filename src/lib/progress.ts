"use client";

/**
 * Who has finished what.
 *
 * One document per completed lesson, `progress/{uid}__{lessonId}`, rather than
 * an array on the user: two lessons finished at once cannot clobber each other,
 * and a teacher listing the whole cohort is a single collection read.
 *
 * The document id is derived from uid + lesson, so marking the same lesson done
 * twice overwrites instead of creating duplicates that would inflate the
 * counts.
 *
 * This is also what makes the admin dashboard real. Without it the roster would
 * be a table of names with nothing in it.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "./firebase";

const PROGRESS = "progress";
const CHALLENGE_PROGRESS = "challengeProgress";
const NOTES = "staffNotes";
const USERS = "users";

/** Considered "online" when seen within this window. */
export const ONLINE_WINDOW_MS = 5 * 60 * 1000;
/** No activity for this long and a learner is flagged as stalled. */
export const STUCK_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export interface ProgressRecord {
  uid: string;
  lessonId: string;
  trackId: string;
  xp: number;
  completedAt: number;
}

function idFor(uid: string, lessonId: string): string {
  return `${uid}__${lessonId}`;
}

/* ------------------------------------------------------------- learner */

export async function markLessonDone(
  uid: string,
  trackId: string,
  lessonId: string,
  xp: number,
): Promise<void> {
  const record: ProgressRecord = { uid, trackId, lessonId, xp, completedAt: Date.now() };
  await setDoc(doc(getDb(), PROGRESS, idFor(uid, lessonId)), record);
}

export async function unmarkLessonDone(uid: string, lessonId: string): Promise<void> {
  await deleteDoc(doc(getDb(), PROGRESS, idFor(uid, lessonId)));
}

export async function isLessonDone(uid: string, lessonId: string): Promise<boolean> {
  const snap = await getDoc(doc(getDb(), PROGRESS, idFor(uid, lessonId)));
  return snap.exists();
}

/** Everything one learner has finished. Single equality filter, so no index. */
export async function fetchMyProgress(uid: string): Promise<ProgressRecord[]> {
  const snap = await getDocs(query(collection(getDb(), PROGRESS), where("uid", "==", uid)));
  return snap.docs.map((d) => d.data() as ProgressRecord);
}

/* -------------------------------------------------------- challenges */

/**
 * Solved challenges, mirroring lesson progress exactly: one document per
 * solve (`challengeProgress/{uid}__{challengeId}`), so two challenges solved
 * at once cannot clobber each other and the admin roster is one more
 * collection read, not N.
 */
/**
 * A solved challenge. Note there is no `xp` here: XP comes from lessons only.
 * Challenges are optional practice, and giving them a second currency made
 * one score into two competing ones.
 */
export interface ChallengeProgressRecord {
  uid: string;
  challengeId: string;
  trackId: string;
  completedAt: number;
}

function challengeIdFor(uid: string, challengeId: string): string {
  return `${uid}__${challengeId}`;
}

export async function markChallengeSolved(
  uid: string,
  trackId: string,
  challengeId: string,
): Promise<void> {
  const record: ChallengeProgressRecord = { uid, trackId, challengeId, completedAt: Date.now() };
  await setDoc(doc(getDb(), CHALLENGE_PROGRESS, challengeIdFor(uid, challengeId)), record);
}

export async function unmarkChallengeSolved(uid: string, challengeId: string): Promise<void> {
  await deleteDoc(doc(getDb(), CHALLENGE_PROGRESS, challengeIdFor(uid, challengeId)));
}

export async function fetchMyChallengeProgress(uid: string): Promise<ChallengeProgressRecord[]> {
  const snap = await getDocs(
    query(collection(getDb(), CHALLENGE_PROGRESS), where("uid", "==", uid)),
  );
  return snap.docs.map((d) => d.data() as ChallengeProgressRecord);
}

export async function fetchAllChallengeProgress(): Promise<ChallengeProgressRecord[]> {
  const snap = await getDocsFromServer(collection(getDb(), CHALLENGE_PROGRESS));
  return snap.docs.map((d) => d.data() as ChallengeProgressRecord);
}

/**
 * Record that this learner is around, for the dashboard's online dot.
 *
 * Throttled through localStorage because it is a Firestore WRITE and the free
 * tier allows 20k a day: without the throttle a learner who leaves a tab open
 * would spend the whole quota by themselves.
 */
export async function touchLastSeen(uid: string): Promise<void> {
  const key = `axilearn-seen-${uid}`;
  const last = Number(localStorage.getItem(key) ?? 0);
  if (Date.now() - last < 4 * 60 * 1000) return;
  localStorage.setItem(key, String(Date.now()));
  // Only ever writes lastSeenAt; role stays untouched, which is what the
  // security rules require of a self-update.
  await updateDoc(doc(getDb(), USERS, uid), { lastSeenAt: Date.now() });
}

/* --------------------------------------------------------------- admin */

/**
 * Every admin-facing read below (fetchAll..., list...) reads with
 * `getDocsFromServer`, not the plain `getDocs`. The Firestore JS SDK keeps a
 * local persistence cache
 * and, by default, `getDocs` is free to answer from it -- fine for a
 * learner's own progress, where a few seconds of staleness is invisible, but
 * wrong for a roster: a teacher opening the dashboard right after a student
 * signs up needs to see that student, not whatever this browser tab's cache
 * happened to have before the sign-up occurred. Forcing the server round-trip
 * on every admin read is the fix.
 */
export interface StudentRow {
  uid: string;
  displayName: string;
  email: string | null;
  role: "student" | "admin";
  locale: string;
  createdAt: number | null;
  lastSeenAt: number | null;
}

export async function fetchAllStudents(): Promise<StudentRow[]> {
  const snap = await getDocsFromServer(collection(getDb(), USERS));
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    const created = data.createdAt as { toMillis?: () => number } | number | undefined;
    return {
      uid: d.id,
      displayName: String(data.displayName ?? "—"),
      email: (data.email as string | null) ?? null,
      role: data.role === "admin" ? "admin" : "student",
      locale: String(data.locale ?? "en"),
      createdAt:
        typeof created === "number"
          ? created
          : created && typeof created.toMillis === "function"
            ? created.toMillis()
            : null,
      lastSeenAt: typeof data.lastSeenAt === "number" ? data.lastSeenAt : null,
    };
  });
}

export async function fetchAllProgress(): Promise<ProgressRecord[]> {
  const snap = await getDocsFromServer(collection(getDb(), PROGRESS));
  return snap.docs.map((d) => d.data() as ProgressRecord);
}

/* --------------------------------------------------- teacher's remarks */

export interface StaffNote {
  uid: string;
  text: string;
  updatedAt: number;
}

/**
 * A teacher's private note about a learner.
 *
 * Kept in its own collection, not on the user document, for one reason: the
 * rules let a learner read their own user document. A remark like "struggling
 * with loops, needs a call home" must not be one console click away from the
 * person it is about.
 */
export async function fetchAllNotes(): Promise<Record<string, StaffNote>> {
  const snap = await getDocsFromServer(collection(getDb(), NOTES));
  const out: Record<string, StaffNote> = {};
  for (const d of snap.docs) {
    const data = d.data() as Partial<StaffNote>;
    out[d.id] = { uid: d.id, text: String(data.text ?? ""), updatedAt: Number(data.updatedAt ?? 0) };
  }
  return out;
}

export async function saveNote(uid: string, text: string): Promise<void> {
  await setDoc(doc(getDb(), NOTES, uid), { text, updatedAt: Date.now() });
}

/* ------------------------------------------------------------ derived */

export interface StudentStats {
  completed: number;
  xp: number;
  lastActivity: number | null;
  perTrack: Record<string, number>;
}

export function statsFor(uid: string, all: ProgressRecord[]): StudentStats {
  const mine = all.filter((p) => p.uid === uid);
  const perTrack: Record<string, number> = {};
  let xp = 0;
  let lastActivity: number | null = null;
  for (const p of mine) {
    perTrack[p.trackId] = (perTrack[p.trackId] ?? 0) + 1;
    xp += p.xp ?? 0;
    if (!lastActivity || p.completedAt > lastActivity) lastActivity = p.completedAt;
  }
  return { completed: mine.length, xp, lastActivity, perTrack };
}

/**
 * `now` is passed in rather than read here, so a component can render this
 * without calling the clock mid-render -- which is impure and, with the React
 * Compiler, free to disagree between two renders of the same frame.
 */
export function isOnline(lastSeenAt: number | null, now: number = Date.now()): boolean {
  return lastSeenAt != null && now - lastSeenAt < ONLINE_WINDOW_MS;
}

/**
 * Consecutive days with at least one completion, counting back from today.
 *
 * A day is only "missed" once it is over, so finishing nothing yet today does
 * not break a streak -- it starts counting at yesterday instead. Otherwise
 * every learner's streak would read 0 every morning, which teaches them the
 * number is meaningless.
 *
 * Days are stepped with setDate rather than subtracting 86400000 so the count
 * survives a daylight-saving change.
 */
export function streakFromRecords(records: ProgressRecord[], now: number): number {
  if (!records.length || !now) return 0;

  const startOf = (ms: number) => {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const days = new Set(records.map((r) => startOf(r.completedAt)));

  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.getTime())) return 0;
  }

  let streak = 0;
  while (days.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** XP -> level, so the number on a profile means something consistent. */
export function levelFromXp(xp: number): { level: number; into: number; span: number } {
  // Each level costs 100 more than the last: 200, 300, 400 ...
  let level = 1;
  let remaining = xp;
  let span = 200;
  while (remaining >= span) {
    remaining -= span;
    level++;
    span += 100;
  }
  return { level, into: remaining, span };
}
