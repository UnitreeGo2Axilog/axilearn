"use client";

/**
 * Content reads and writes for the CMS.
 *
 * This half uses the Firebase client SDK, unlike the public reads in store.ts,
 * for one reason: the admin is signed in, so the security rules let these calls
 * see DRAFTS. Nothing here needs a service-account key -- the supervisor's own
 * login is the credential, which is also why "Import starter content" is a
 * button in the app rather than a script somebody has to run.
 *
 * Lessons live in an array inside their track document, so editing one is a
 * read-modify-write. Only the `lessons` field is written back, never the whole
 * document, so two people editing different parts of a track do not erase each
 * other's work.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { repoTrackDocs } from "./repo-content";
import { lessonBodies } from "./lesson-bodies";
import { lessonQuizzes } from "./lesson-quizzes";
import { repoChallenges } from "./challenges";
import type { ChallengeDoc, L10n, LessonEntry, LessonQuiz, PublishStatus, TrackDoc } from "./schema";

const TRACKS = "tracks";

/** Strip undefined -- Firestore rejects it, and optional fields are common here. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/* --------------------------------------------------------------- tracks */

export async function listTrackDocs(): Promise<TrackDoc[]> {
  const snap = await getDocs(collection(getDb(), TRACKS));
  return snap.docs
    .map((d) => ({ ...(d.data() as TrackDoc), id: d.id }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function readTrackDoc(id: string): Promise<TrackDoc | null> {
  const snap = await getDoc(doc(getDb(), TRACKS, id));
  return snap.exists() ? { ...(snap.data() as TrackDoc), id: snap.id } : null;
}

export async function saveTrackDoc(track: TrackDoc): Promise<void> {
  const { id, ...rest } = clean(track);
  await setDoc(doc(getDb(), TRACKS, id), { ...rest, updatedAt: Date.now() }, { merge: true });
}

export async function deleteTrackDoc(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), TRACKS, id));
}

/* -------------------------------------------------------------- lessons */

/** Insert or replace one lesson, leaving the rest of the track untouched. */
export async function saveLesson(trackId: string, lesson: LessonEntry): Promise<void> {
  const track = await readTrackDoc(trackId);
  if (!track) throw new Error(`Track "${trackId}" does not exist`);
  const lessons = [...(track.lessons ?? [])];
  const at = lessons.findIndex((l) => l.id === lesson.id);
  if (at >= 0) lessons[at] = lesson;
  else lessons.push({ ...lesson, order: lessons.length });
  await updateDoc(doc(getDb(), TRACKS, trackId), {
    lessons: clean(renumber(lessons)),
    updatedAt: Date.now(),
  });
  // The body document mirrors the lesson's status because the security rules
  // read it there; without this an unpublished lesson's text would stay
  // world-readable after the lesson itself was pulled back to draft.
  await setDoc(
    doc(getDb(), TRACKS, trackId, "bodies", lesson.id),
    { status: lesson.status },
    { merge: true },
  );
}

export async function deleteLesson(trackId: string, lessonId: string): Promise<void> {
  const track = await readTrackDoc(trackId);
  if (!track) return;
  const lessons = renumber((track.lessons ?? []).filter((l) => l.id !== lessonId));
  await updateDoc(doc(getDb(), TRACKS, trackId), { lessons: clean(lessons), updatedAt: Date.now() });
  await deleteDoc(doc(getDb(), TRACKS, trackId, "bodies", lessonId)).catch(() => {});
}

/** Move a lesson one step up or down; order is what the map layout reads. */
export async function moveLesson(
  trackId: string,
  lessonId: string,
  direction: -1 | 1,
): Promise<void> {
  const track = await readTrackDoc(trackId);
  if (!track) return;
  const lessons = [...(track.lessons ?? [])].sort((a, b) => a.order - b.order);
  const at = lessons.findIndex((l) => l.id === lessonId);
  const to = at + direction;
  if (at < 0 || to < 0 || to >= lessons.length) return;
  [lessons[at], lessons[to]] = [lessons[to], lessons[at]];
  await updateDoc(doc(getDb(), TRACKS, trackId), {
    lessons: clean(renumber(lessons)),
    updatedAt: Date.now(),
  });
}

/** Order is always 0..n-1 in array order, so no gaps or ties can build up. */
function renumber(lessons: LessonEntry[]): LessonEntry[] {
  return lessons.map((l, i) => ({ ...l, order: i }));
}

/* ----------------------------------------------------------- lesson body */

export interface LessonBodyDoc {
  content: L10n;
  quiz: LessonQuiz;
}

export async function readLessonBody(trackId: string, lessonId: string): Promise<LessonBodyDoc> {
  const snap = await getDoc(doc(getDb(), TRACKS, trackId, "bodies", lessonId));
  const data = snap.exists() ? (snap.data() as { content?: L10n; quiz?: LessonQuiz }) : null;
  return { content: data?.content ?? { en: "" }, quiz: data?.quiz ?? [] };
}

export async function saveLessonBody(
  trackId: string,
  lessonId: string,
  content: L10n,
  quiz: LessonQuiz,
  status: PublishStatus,
): Promise<void> {
  await setDoc(
    doc(getDb(), TRACKS, trackId, "bodies", lessonId),
    { content: clean(content), quiz: clean(quiz), status, updatedAt: Date.now() },
    { merge: true },
  );
}

/* ---------------------------------------------------------------- import */

export interface ImportResult {
  written: string[];
  skipped: string[];
  /** Lesson ids that got real body text written, on this run. */
  bodiesWritten: string[];
  /** Challenge ids created, on this run. */
  challengesWritten: string[];
}

/**
 * Copy the repo curriculum into Firestore.
 *
 * Existing TRACKS are skipped unless `overwrite` is asked for, so pressing the
 * button twice cannot wipe edited track metadata. This is why no
 * service-account key exists in this project: the seed runs as the signed-in
 * admin.
 *
 * LESSON BODIES AND QUIZZES are handled separately from that skip, on
 * purpose. A track that already exists in Firestore (because it was imported
 * before) can still be missing body text or a quiz, if that content was added
 * to the repo after the first import. So every lesson is checked on its own,
 * field by field: if Firestore's text for it is still empty, the text gets
 * written; if its quiz is still empty, the quiz gets written -- independently
 * of each other and independently of whether the track around it was
 * skipped. If an admin already wrote or edited either one in the CMS, it is
 * left alone -- the check is "is Firestore empty", not "did the track get
 * skipped".
 */
export async function importStarterContent(overwrite = false): Promise<ImportResult> {
  const existing = new Set((await listTrackDocs()).map((t) => t.id));
  const batch = writeBatch(getDb());
  const written: string[] = [];
  const skipped: string[] = [];

  for (const track of repoTrackDocs) {
    if (existing.has(track.id) && !overwrite) {
      skipped.push(track.id);
      continue;
    }
    const { id, ...rest } = clean(track);
    batch.set(doc(getDb(), TRACKS, id), { ...rest, updatedAt: Date.now() }, { merge: false });
    written.push(id);
  }

  if (written.length) await batch.commit();

  const bodiesWritten: string[] = [];
  for (const track of repoTrackDocs) {
    for (const lesson of track.lessons) {
      const repoText = lessonBodies[lesson.id];
      const repoQuiz = lessonQuizzes[lesson.id];
      if (!repoText && !repoQuiz) continue;

      const current = await readLessonBody(track.id, lesson.id);
      const needsText = Boolean(repoText) && !current.content.en.trim();
      const needsQuiz = Boolean(repoQuiz) && current.quiz.length === 0;
      if (!needsText && !needsQuiz) continue; // admin already wrote both

      await saveLessonBody(
        track.id,
        lesson.id,
        needsText ? repoText! : current.content,
        needsQuiz ? repoQuiz! : current.quiz,
        lesson.status,
      );
      bodiesWritten.push(lesson.id);
    }
  }

  const challengesWritten: string[] = [];
  for (const track of repoTrackDocs) {
    const repoList = repoChallenges[track.id];
    if (!repoList?.length) continue;
    for (const challenge of repoList) {
      const exists = await readChallenge(track.id, challenge.id);
      if (exists) continue; // an admin-authored or previously-imported challenge
      await saveChallenge(track.id, challenge);
      challengesWritten.push(challenge.id);
    }
  }

  return { written, skipped, bodiesWritten, challengesWritten };
}

/* ------------------------------------------------------------ challenges */

const CHALLENGES = "challenges";

export async function listChallenges(trackId: string): Promise<ChallengeDoc[]> {
  const snap = await getDocs(collection(getDb(), TRACKS, trackId, CHALLENGES));
  return snap.docs
    .map((d) => ({ ...(d.data() as ChallengeDoc), id: d.id }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function readChallenge(trackId: string, id: string): Promise<ChallengeDoc | null> {
  const snap = await getDoc(doc(getDb(), TRACKS, trackId, CHALLENGES, id));
  return snap.exists() ? { ...(snap.data() as ChallengeDoc), id: snap.id } : null;
}

export async function saveChallenge(trackId: string, challenge: ChallengeDoc): Promise<void> {
  const { id, ...rest } = clean(challenge);
  await setDoc(
    doc(getDb(), TRACKS, trackId, CHALLENGES, id),
    { ...rest, updatedAt: Date.now() },
    { merge: false },
  );
}

export async function deleteChallenge(trackId: string, id: string): Promise<void> {
  await deleteDoc(doc(getDb(), TRACKS, trackId, CHALLENGES, id));
}

/** Move a challenge one step up or down within the track's whole list. */
export async function moveChallenge(
  trackId: string,
  id: string,
  direction: -1 | 1,
): Promise<void> {
  const list = await listChallenges(trackId);
  const at = list.findIndex((c) => c.id === id);
  const to = at + direction;
  if (at < 0 || to < 0 || to >= list.length) return;
  const a = list[at];
  const b = list[to];
  await Promise.all([
    updateDoc(doc(getDb(), TRACKS, trackId, CHALLENGES, a.id), { order: b.order }),
    updateDoc(doc(getDb(), TRACKS, trackId, CHALLENGES, b.id), { order: a.order }),
  ]);
}
