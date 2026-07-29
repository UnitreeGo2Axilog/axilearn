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
import type { L10n, LessonEntry, PublishStatus, TrackDoc } from "./schema";

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

export async function readLessonBody(trackId: string, lessonId: string): Promise<L10n> {
  const snap = await getDoc(doc(getDb(), TRACKS, trackId, "bodies", lessonId));
  const data = snap.exists() ? (snap.data() as { content?: L10n }) : null;
  return data?.content ?? { en: "" };
}

export async function saveLessonBody(
  trackId: string,
  lessonId: string,
  content: L10n,
  status: PublishStatus,
): Promise<void> {
  await setDoc(
    doc(getDb(), TRACKS, trackId, "bodies", lessonId),
    { content: clean(content), status, updatedAt: Date.now() },
    { merge: true },
  );
}

/* ---------------------------------------------------------------- import */

export interface ImportResult {
  written: string[];
  skipped: string[];
}

/**
 * Copy the repo curriculum into Firestore.
 *
 * Existing tracks are skipped unless `overwrite` is asked for, so pressing the
 * button twice cannot wipe edited content. This is why no service-account key
 * exists in this project: the seed runs as the signed-in admin.
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
  return { written, skipped };
}
