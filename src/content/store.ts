/**
 * Server-side content reads.
 *
 * Content is fetched over Firestore's REST API rather than through the client
 * SDK. Three reasons: it is a plain `fetch`, so it can be wrapped in a cache
 * with the 60-second TTL we need to stay inside the free tier's 50k reads a
 * day; the client SDK opens long-lived channels that have no business running
 * during server rendering; and no service-account key is involved, so nothing
 * secret has to exist for the site to render.
 *
 * Unauthenticated reads only ever see PUBLISHED content -- that is enforced by
 * the security rules, not by this file. Drafts are read client-side by a
 * signed-in admin (see admin-content.ts).
 *
 * If Firestore is empty or unreachable the repo curriculum is served instead,
 * so the site is never blank.
 */
import { unstable_cache } from "next/cache";
import { repoTrackDoc, repoTrackDocs } from "./repo-content";
import { lessonBodies } from "./lesson-bodies";
import { toRoadmapTrack, type TrackDoc } from "./schema";
import type { Level, RoadmapTrack } from "./roadmap-data";
import type { Locale } from "./types";

const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

/** How long a content read is reused before we ask Firestore again. */
export const CONTENT_TTL_SECONDS = 60;

const BASE = PROJECT
  ? `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`
  : null;

/* ---------------------------------------------- Firestore REST decoding */

type RestValue = Record<string, unknown>;

/** Firestore wraps every value in a type tag; unwrap it into plain JS. */
function decode(value: RestValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) {
    const arr = (value.arrayValue as { values?: RestValue[] }).values ?? [];
    return arr.map(decode);
  }
  if ("mapValue" in value) {
    const fields = (value.mapValue as { fields?: Record<string, RestValue> }).fields ?? {};
    return decodeFields(fields);
  }
  return undefined;
}

function decodeFields(fields: Record<string, RestValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) out[k] = decode(v);
  return out;
}

function docId(name: string): string {
  return name.slice(name.lastIndexOf("/") + 1);
}

/* ------------------------------------------------------------ coercion */

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
function l10nOf(v: unknown): { en: string; fr?: string } {
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const en = str(o.en);
    const fr = str(o.fr);
    return fr ? { en, fr } : { en };
  }
  return { en: str(v) };
}
function l10nList(v: unknown): { en: string; fr?: string }[] {
  return Array.isArray(v) ? v.map(l10nOf) : [];
}

/**
 * Turn a raw document into a TrackDoc, tolerating gaps.
 *
 * A CMS produces half-finished documents by design -- someone saves a track
 * before writing its lessons. Missing fields get defaults rather than throwing,
 * because one unfinished draft must not take the site down.
 */
function asTrackDoc(id: string, raw: Record<string, unknown>): TrackDoc {
  const ov = (raw.overview ?? {}) as Record<string, unknown>;
  const primer = ov.primer as Record<string, unknown> | undefined;
  const lessons = Array.isArray(raw.lessons) ? (raw.lessons as Record<string, unknown>[]) : [];

  return {
    id,
    order: num(raw.order, 99),
    status: raw.status === "draft" ? "draft" : "published",
    ...(raw.hidden === true ? { hidden: true } : {}),
    ...(raw.comingSoon === true ? { comingSoon: true } : {}),
    short: str(raw.short, id.slice(0, 8).toUpperCase()),
    color: str(raw.color, "#22d3ee"),
    glow: str(raw.glow, "34,211,238"),
    icon: str(raw.icon, "Bot"),
    title: l10nOf(raw.title),
    description: l10nOf(raw.description),
    overview: {
      tagline: l10nOf(ov.tagline),
      forWho: l10nOf(ov.forWho),
      outcomes: l10nList(ov.outcomes),
      advice: l10nList(ov.advice),
      ...(primer
        ? {
            primer: {
              title: l10nOf(primer.title),
              why: l10nOf(primer.why),
              minutes: num(primer.minutes, 60),
              lessons: l10nList(primer.lessons),
              ...(primer.trackId ? { trackId: str(primer.trackId) } : {}),
            },
          }
        : {}),
    },
    lessons: lessons.map((l, i) => ({
      id: str(l.id, `l-${i + 1}`),
      order: num(l.order, i),
      status: l.status === "draft" ? "draft" : "published",
      type:
        l.type === "checkpoint" || l.type === "project" || l.type === "final_project"
          ? l.type
          : "lesson",
      difficulty: l.difficulty === "medium" || l.difficulty === "hard" ? l.difficulty : "easy",
      xpReward: num(l.xpReward, 50),
      durationMinutes: num(l.durationMinutes, 20),
      skills: Array.isArray(l.skills) ? l.skills.map((s) => str(s)).filter(Boolean) : [],
      title: l10nOf(l.title),
      shortDescription: l10nOf(l.shortDescription),
      ...(l.badge ? { badge: str(l.badge) } : {}),
      ...(l.section ? { section: str(l.section) } : {}),
      ...(l.videoId ? { videoId: str(l.videoId) } : {}),
    })),
  };
}

/* --------------------------------------------------------------- reads */

let warned = false;
function warnOnce(what: string) {
  if (warned) return;
  warned = true;
  console.warn(`[content] ${what} -- serving the curriculum bundled in the repo instead.`);
}

/**
 * Every published track: from Firestore when there is any, repo otherwise.
 *
 * The read is a QUERY FILTERED ON `status == "published"`, not a plain list,
 * and that is not a detail. Firestore rules are not filters: a rule that hides
 * drafts by looking at `resource.data.status` rejects any list query that has
 * not already constrained that field. Asking for published tracks explicitly is
 * what makes the draft rule enforceable rather than decorative.
 *
 * A filtered query has to be a POST, and Next's fetch cache only covers GET, so
 * the result is wrapped in `unstable_cache` instead. That does both jobs at
 * once: Firestore is read at most once a minute however many visitors arrive,
 * and pages can still be prerendered rather than being forced dynamic by an
 * uncacheable fetch.
 */
const fetchTrackDocs = unstable_cache(
  async (): Promise<TrackDoc[]> => {
    const res = await fetch(`${BASE}:runQuery?key=${KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "tracks" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "status" },
              op: "EQUAL",
              value: { stringValue: "published" },
            },
          },
          // No orderBy: an equality filter plus an order on a DIFFERENT field
          // needs a composite index, and without it Firestore rejects the
          // query outright -- which here would look like "my content vanished"
          // as the repo fallback quietly took over. The sort below is free.
          limit: 50,
        },
      }),
    });
    if (!res.ok) {
      warnOnce(`Firestore returned ${res.status} for the tracks query`);
      return repoTrackDocs;
    }
    // runQuery streams result rows; rows without a `document` are just read
    // receipts, which is what an empty collection looks like.
    const rows = (await res.json()) as {
      document?: { name: string; fields?: Record<string, RestValue> };
    }[];
    const docs = (Array.isArray(rows) ? rows : [])
      .filter((r) => r.document)
      .map((r) => asTrackDoc(docId(r.document!.name), decodeFields(r.document!.fields ?? {})))
      .sort((a, b) => a.order - b.order);

    if (docs.length === 0) return repoTrackDocs; // nothing imported yet
    return docs;
  },
  ["axilearn-published-tracks"],
  { revalidate: CONTENT_TTL_SECONDS, tags: ["content"] },
);

export async function getTrackDocs(): Promise<TrackDoc[]> {
  if (!BASE || !KEY) return repoTrackDocs;
  try {
    return await fetchTrackDocs();
  } catch (err) {
    warnOnce(`could not reach Firestore (${(err as Error).message})`);
    return repoTrackDocs;
  }
}

/** Every track a learner may see, in the page's shape. */
export async function getTracks(locale: Locale): Promise<RoadmapTrack[]> {
  const docs = await getTrackDocs();
  return docs.map((d) => toRoadmapTrack(d, locale));
}

/** One track, or undefined when the id does not exist. */
export async function getTrack(locale: Locale, id: string): Promise<RoadmapTrack | undefined> {
  const docs = await getTrackDocs();
  const hit = docs.find((d) => d.id === id) ?? repoTrackDoc(id);
  return hit ? toRoadmapTrack(hit, locale) : undefined;
}

/** Tracks shown in the main switcher -- the optional primer stays hidden. */
export async function getMainTracks(locale: Locale): Promise<RoadmapTrack[]> {
  return (await getTracks(locale)).filter((t) => !t.hidden);
}

/**
 * A lesson's long text, stored apart from its track so the track document
 * stays small.
 *
 * Falls back to the repo's own lesson-bodies.ts when Firestore has nothing --
 * same reasoning as repoTrackDocs: a fresh clone with no Firestore project
 * configured should still teach something, not show "coming soon" on every
 * lesson that hasn't been imported yet.
 */
export async function getLessonBody(
  trackId: string,
  lessonId: string,
  locale: Locale,
): Promise<string | null> {
  const repoFallback = () => {
    const text = lessonBodies[lessonId];
    if (!text) return null;
    const picked = locale === "fr" ? text.fr || text.en : text.en;
    return picked?.trim() ? picked : null;
  };

  if (!BASE || !KEY) return repoFallback();
  try {
    const res = await fetch(`${BASE}/tracks/${trackId}/bodies/${lessonId}?key=${KEY}`, {
      next: { revalidate: CONTENT_TTL_SECONDS, tags: ["content"] },
    });
    if (!res.ok) return repoFallback();
    const body = (await res.json()) as { fields?: Record<string, RestValue> };
    const content = l10nOf(decodeFields(body.fields ?? {}).content);
    const text = locale === "fr" ? content.fr || content.en : content.en;
    return text?.trim() ? text : repoFallback();
  } catch {
    return repoFallback();
  }
}

/**
 * Find a lesson by id across every track.
 *
 * Lesson URLs carry only the lesson id, so the track has to be found rather
 * than passed. It costs nothing extra: the tracks are already in the cache.
 */
export async function getLessonLocation(
  locale: Locale,
  lessonId: string,
): Promise<{ track: RoadmapTrack; level: Level; next: Level | null } | null> {
  for (const track of await getTracks(locale)) {
    const i = track.levels.findIndex((l) => l.id === lessonId);
    if (i >= 0) {
      return { track, level: track.levels[i], next: track.levels[i + 1] ?? null };
    }
  }
  return null;
}
