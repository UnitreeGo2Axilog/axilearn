/**
 * How content is stored in Firestore, and how it becomes the shapes the pages
 * already render.
 *
 * Two decisions worth knowing:
 *
 * 1. ONE DOCUMENT PER TRACK, with its lessons as an ordered array. A document
 *    per lesson would read cleaner, but a single map screen would then cost
 *    1 + n reads; the free tier allows 50k a day and there is no paid plan
 *    here. A track doc costs one read no matter how many lessons it holds.
 *    Long lesson text would eventually threaten Firestore's 1 MiB document
 *    limit, so the BODY of each lesson lives in its own
 *    `tracks/{id}/bodies/{lessonId}` document, fetched only when a learner
 *    actually opens that lesson.
 *
 * 2. NO MAP COORDINATES ARE STORED. A lesson knows its order; where its
 *    hexagon sits on the map is computed by `layout()`. Nobody editing the
 *    curriculum should have to think in percentages, and reordering a lesson
 *    cannot leave two nodes on top of each other.
 *
 * English is required on every string, French is optional and falls back to
 * English, so the supervisor can publish a lesson before it is translated.
 */
import {
  layout,
  type Difficulty,
  type Level,
  type LevelState,
  type LevelType,
  type RoadmapTrack,
} from "./roadmap-data";
import type { Locale } from "./types";

/** A string that must exist in English and may exist in French. */
export interface L10n {
  en: string;
  fr?: string;
}

export type PublishStatus = "draft" | "published";

/** Read a localized string, falling back to English when untranslated. */
export function pick(value: L10n | undefined, locale: Locale): string {
  if (!value) return "";
  const hit = locale === "en" ? value.en : value.fr;
  return (hit && hit.trim()) || value.en || "";
}

export function l10n(en: string, fr?: string): L10n {
  return fr ? { en, fr } : { en };
}

/** One lesson as stored inside its track document. */
export interface LessonEntry {
  id: string;
  order: number;
  status: PublishStatus;
  type: LevelType;
  difficulty: Difficulty;
  xpReward: number;
  durationMinutes: number;
  skills: string[];
  title: L10n;
  shortDescription: L10n;
  badge?: string;
  section?: string;
  /** YouTube video ID only -- we embed, we never host video files. */
  videoId?: string;
  /** Seeds the in-browser Python editor. Presence is what turns a lesson
   *  into an interactive one. */
  starterCode?: string;
}

/**
 * One multiple-choice question, stored the same bilingual way as everything
 * else. `correctIndex` picks the right entry in `options` (2-4 of them).
 *
 * This is what a lesson's "mark as done" gates on. Without it, completion was
 * a single unguarded button -- a learner could mark a lesson finished without
 * having read a word of it, and every progress number on the platform
 * (map, profile, admin roster) would have been reporting that as real
 * learning. A quiz that can only be written from having actually read the
 * lesson closes that gap.
 */
export interface QuizQuestion {
  question: L10n;
  options: L10n[];
  correctIndex: number;
  /** Shown after answering, right or wrong -- this is the teaching moment. */
  explanation?: L10n;
}

export type LessonQuiz = QuizQuestion[];

/** A quiz resolved to one language, ready for the UI. */
export interface ResolvedQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}
export type ResolvedQuiz = ResolvedQuizQuestion[];

export function resolveQuiz(quiz: LessonQuiz | undefined, locale: Locale): ResolvedQuiz | null {
  if (!quiz || quiz.length === 0) return null;
  return quiz.map((q) => ({
    question: pick(q.question, locale),
    options: q.options.map((o) => pick(o, locale)),
    correctIndex: q.correctIndex,
    ...(q.explanation ? { explanation: pick(q.explanation, locale) } : {}),
  }));
}

export function emptyQuizQuestion(): QuizQuestion {
  return {
    question: { en: "" },
    options: [{ en: "" }, { en: "" }],
    correctIndex: 0,
  };
}

/**
 * A challenge: a standalone practice problem for a whole track, tagged by
 * difficulty, separate from any one lesson.
 *
 * Where a lesson's quiz checks whether someone read THAT lesson, a challenge
 * asks them to actually write code -- something to come back to, grouped by
 * how hard it is, with its own solved/unsolved state.
 */
export type ChallengeDifficulty = "easy" | "medium" | "hard";

/**
 * Challenges are CODE problems: write a function, submit, get graded against
 * test cases -- the HackerRank shape, run in our own in-browser Python.
 *
 * `kind` still exists because earlier challenges were multiple-choice and may
 * already be sitting in somebody's Firestore. Those keep rendering as MCQ
 * rather than breaking; the importer upgrades the ones it shipped (see
 * admin-content.ts). New challenges are code by default.
 *
 * There is deliberately NO xpReward here any more: XP is earned from lessons
 * only. A challenge is optional practice, and giving it its own currency made
 * two competing scores out of one idea.
 */
export type ChallengeKind = "mcq" | "code";

/**
 * One graded case. `call` and `expected` are both Python EXPRESSIONS, so a
 * test reads exactly like the line you would type to check it yourself:
 *
 *     call: "add(2, 3)"      expected: "5"
 *
 * Anything Python can compare works -- lists, strings, tuples -- because both
 * sides are evaluated, not string-matched.
 */
export interface ChallengeTest {
  call: string;
  expected: string;
  /** Graded, but not shown before submitting -- stops answer-shaped guessing. */
  hidden?: boolean;
}

export interface ChallengeDoc {
  id: string;
  /**
   * The lesson this practises.
   *
   * A challenge used to belong only to a track, which made the whole set one
   * undifferentiated pile: a learner finishing chapter two was offered the
   * same twelve problems as one finishing chapter eight, most of them about
   * things they had not met yet. Tied to a lesson, "your turn" can hand them
   * the one exercise that is about what they just read.
   *
   * Optional, because a track can still carry general practice that belongs
   * to no particular chapter.
   */
  lessonId?: string;
  /** Written by the importer, never by the CMS. Marks a challenge as the
   *  repo's, so a restructure can retire it without touching one the
   *  supervisor wrote by hand. */
  fromRepo?: boolean;
  order: number;
  status: PublishStatus;
  difficulty: ChallengeDifficulty;
  kind: ChallengeKind;
  title: L10n;
  prompt: L10n;
  explanation?: L10n;
  /** MCQ only. */
  options: L10n[];
  /** MCQ only. */
  correctIndex: number;
  /** Code only: the stub the learner starts from. */
  starterCode?: string;
  /** Code only: what "solved" means. */
  tests?: ChallengeTest[];
  /**
   * The worked solution. Kept behind an explicit unlock the learner has to
   * choose, because a visible answer is not a hint -- it ends the exercise.
   */
  editorial?: L10n;
  /**
   * How to approach it, WITHOUT the answer. Freely readable: someone stuck at
   * "I have no idea where to start" should not have to burn the solution to
   * get moving, which is the gap a tutorial fills and an editorial does not.
   */
  tutorial?: L10n;
}

export interface ResolvedChallenge {
  id: string;
  lessonId?: string;
  difficulty: ChallengeDifficulty;
  kind: ChallengeKind;
  title: string;
  prompt: string;
  explanation?: string;
  options: string[];
  correctIndex: number;
  starterCode: string;
  tests: ChallengeTest[];
  editorial: string;
  tutorial: string;
}

export function resolveChallenge(c: ChallengeDoc, locale: Locale): ResolvedChallenge {
  const explanation = c.explanation ? pick(c.explanation, locale) : undefined;
  const tests = c.tests ?? [];
  // A challenge with tests is a code challenge whatever the stored kind says:
  // data that actually has graded cases should never render as a quiz.
  const kind: ChallengeKind = c.kind === "code" || tests.length > 0 ? "code" : "mcq";
  return {
    id: c.id,
    ...(c.lessonId ? { lessonId: c.lessonId } : {}),
    difficulty: c.difficulty,
    kind,
    title: pick(c.title, locale),
    prompt: pick(c.prompt, locale),
    options: c.options.map((o) => pick(o, locale)),
    correctIndex: c.correctIndex,
    starterCode: c.starterCode ?? "",
    tests,
    editorial: c.editorial ? pick(c.editorial, locale) : "",
    tutorial: c.tutorial ? pick(c.tutorial, locale) : "",
    ...(explanation ? { explanation } : {}),
  };
}

export function emptyChallengeDoc(id: string, order: number): ChallengeDoc {
  return {
    id,
    order,
    status: "draft",
    difficulty: "easy",
    kind: "code",
    title: { en: "" },
    prompt: { en: "" },
    options: [{ en: "" }, { en: "" }],
    correctIndex: 0,
    starterCode: "def solve():\n    # your code here\n    pass\n",
    tests: [{ call: "solve()", expected: "None" }],
  };
}

export interface PrimerDoc {
  title: L10n;
  why: L10n;
  minutes: number;
  lessons: L10n[];
  /** The track holding the primer's own map. */
  trackId?: string;
}

/** One track document. */
export interface TrackDoc {
  id: string;
  order: number;
  status: PublishStatus;
  hidden?: boolean;
  /** Visible on the home page but not enterable yet. */
  comingSoon?: boolean;
  /** Which revision of the repo's copy this document was written from.
   *  Absent means 1 -- everything imported before revisions existed. */
  repoRevision?: number;
  short: string;
  color: string;
  glow: string;
  icon: string;
  title: L10n;
  description: L10n;
  overview: {
    tagline: L10n;
    forWho: L10n;
    outcomes: L10n[];
    advice: L10n[];
    primer?: PrimerDoc;
  };
  lessons: LessonEntry[];
}

/**
 * Work out which nodes are open.
 *
 * Content does not store progress -- that belongs to the learner. Given the
 * set of lessons they have finished, everything cleared is `completed`, the
 * first unfinished one is `current`, and the rest stay `locked`. With no
 * progress at all that means lesson one is open and nothing else, which is
 * exactly right for someone who just arrived.
 */
export function deriveStates(count: number, completed: Set<string>, ids: string[]): LevelState[] {
  let currentTaken = false;
  return ids.slice(0, count).map((id) => {
    if (completed.has(id)) return "completed" as LevelState;
    if (!currentTaken) {
      currentTaken = true;
      return "current" as LevelState;
    }
    return "locked" as LevelState;
  });
}

/** Turn a stored track into the shape every page already renders. */
export function toRoadmapTrack(
  doc: TrackDoc,
  locale: Locale,
  opts: { includeDrafts?: boolean; completed?: Set<string> } = {},
): RoadmapTrack {
  const completed = opts.completed ?? new Set<string>();

  const entries = [...doc.lessons]
    .filter((l) => opts.includeDrafts || l.status === "published")
    .sort((a, b) => a.order - b.order);

  const positions = layout(entries);
  const states = deriveStates(entries.length, completed, entries.map((l) => l.id));

  const levels: Level[] = entries.map((l, i) => ({
    id: l.id,
    title: pick(l.title, locale),
    shortDescription: pick(l.shortDescription, locale),
    type: l.type,
    state: states[i],
    xpReward: l.xpReward,
    durationMinutes: l.durationMinutes,
    difficulty: l.difficulty,
    position: positions[i],
    skills: l.skills ?? [],
    ...(l.badge ? { badge: l.badge } : {}),
    ...(l.section ? { section: l.section } : {}),
    ...(l.videoId ? { videoId: l.videoId } : {}),
    ...(l.starterCode ? { starterCode: l.starterCode } : {}),
  }));

  return {
    id: doc.id,
    title: pick(doc.title, locale),
    short: doc.short,
    description: pick(doc.description, locale),
    color: doc.color,
    glow: doc.glow,
    icon: doc.icon,
    ...(doc.hidden ? { hidden: true } : {}),
    ...(doc.comingSoon ? { comingSoon: true } : {}),
    overview: {
      tagline: pick(doc.overview.tagline, locale),
      forWho: pick(doc.overview.forWho, locale),
      outcomes: (doc.overview.outcomes ?? []).map((o) => pick(o, locale)),
      advice: (doc.overview.advice ?? []).map((a) => pick(a, locale)),
      ...(doc.overview.primer
        ? {
            primer: {
              title: pick(doc.overview.primer.title, locale),
              why: pick(doc.overview.primer.why, locale),
              minutes: doc.overview.primer.minutes,
              lessons: (doc.overview.primer.lessons ?? []).map((l) => pick(l, locale)),
              ...(doc.overview.primer.trackId
                ? { trackId: doc.overview.primer.trackId }
                : {}),
            },
          }
        : {}),
    },
    levels,
  };
}

/** Blank track, used by the "new track" form. */
export function emptyTrackDoc(id: string, order: number): TrackDoc {
  return {
    id,
    order,
    status: "draft",
    comingSoon: false,
    short: id.slice(0, 8).toUpperCase(),
    color: "#22d3ee",
    glow: "34,211,238",
    icon: "Bot",
    title: { en: "" },
    description: { en: "" },
    overview: { tagline: { en: "" }, forWho: { en: "" }, outcomes: [], advice: [] },
    lessons: [],
  };
}

/** Blank lesson, used by the "new lesson" form. */
export function emptyLessonEntry(id: string, order: number): LessonEntry {
  return {
    id,
    order,
    status: "draft",
    type: "lesson",
    difficulty: "easy",
    xpReward: 50,
    durationMinutes: 20,
    skills: [],
    title: { en: "" },
    shortDescription: { en: "" },
  };
}

/**
 * Pull a YouTube ID out of whatever the admin pasted.
 *
 * Accepts a bare ID, a watch URL, a short youtu.be link or an embed URL --
 * because "paste the link" is the instruction people actually follow.
 */
export function youTubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/* ---------------------------------------------------------- notifications */

/** What a message is about, so the bell can colour and group them. */
export type NotificationCategory =
  | "programming"
  | "games"
  | "robotics"
  | "practice"
  | "announcement";

/**
 * When a message becomes visible.
 *
 *  - `daily`  one message from the daily pool per calendar day, rotating
 *  - `weekly` one from the weekly pool per calendar week, rotating
 *  - `date`   visible from a specific day onward, and then permanently
 *
 * Rotation is what makes "a tip a day" work with no server, no scheduler and
 * no billing plan: the day number picks the message, so every learner opening
 * the app on the same day sees the same one, and nothing has to run overnight
 * to make that true.
 */
export type NotificationSchedule =
  | { kind: "daily" }
  | { kind: "weekly" }
  | { kind: "date"; date: string }; // YYYY-MM-DD

export interface NotificationDoc {
  id: string;
  order: number;
  status: PublishStatus;
  category: NotificationCategory;
  title: L10n;
  body: L10n;
  schedule: NotificationSchedule;
  /** Optional place to send the reader, e.g. a track or a challenge. */
  href?: string;
  updatedAt?: number;
}

export interface ResolvedNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  href?: string;
}

export function resolveNotification(
  doc: NotificationDoc,
  locale: Locale,
): ResolvedNotification {
  return {
    id: doc.id,
    category: doc.category,
    title: pick(doc.title, locale),
    body: pick(doc.body, locale),
    ...(doc.href ? { href: doc.href } : {}),
  };
}

/* ------------------------------------------------------------- messaging */

/**
 * One conversation between a learner and the staff.
 *
 * The metadata lives on this document and the messages themselves in a
 * SUBCOLLECTION, which is not the shape a handful of messages would normally
 * justify. It is here because authorship has to be enforceable: with the
 * messages in an array on this document, anybody allowed to write the
 * document could append an entry labelled `from: "admin"`, and rules cannot
 * check inside an array. As separate documents, each message is validated on
 * creation -- a learner may only ever create one marked "student", and only
 * an admin can create one marked "admin".
 */
export interface ContactThread {
  id: string;
  uid: string;
  /** Copied in, so the inbox does not need a read per learner to show a name. */
  displayName: string;
  email: string | null;
  subject: string;
  createdAt: number;
  updatedAt: number;
  /** Who wrote last -- what the inbox sorts and badges on. */
  lastFrom: "student" | "admin";
  /** A reply the learner has not opened. */
  studentUnread: boolean;
  /** A message the staff has not opened. */
  adminUnread: boolean;
}

export interface ContactMessage {
  id: string;
  from: "student" | "admin";
  text: string;
  at: number;
}

/* -------------------------------------------------------------- homework */

/**
 * A piece of work set by the teacher.
 *
 * `dueAt` is an absolute instant in milliseconds, not a duration. Storing "24
 * hours" would mean every reader computing the deadline from a different
 * starting point; storing the instant means the learner's screen, the
 * teacher's list and the security rule are all talking about the same moment.
 *
 * `dueAt: null` is the switch the teacher can flip: no deadline at all, and
 * nothing is ever marked late.
 */
export interface AssignmentDoc {
  id: string;
  status: PublishStatus;
  title: L10n;
  brief: L10n;
  /** Optional track this belongs to, for grouping. */
  trackId?: string;
  /** Optional stub the learner starts from. */
  starterCode?: string;
  /**
   * An attached brief -- a PDF, an image, a starter file.
   *
   * Held as a data URL on the document rather than in Cloud Storage, which
   * this project does not use and would need rules, a bucket and a billing
   * decision of its own. The cost of that choice is a hard size limit: a
   * Firestore document is capped at 1 MiB and base64 inflates by a third, so
   * anything over ~600 KB is refused at the point of choosing it rather than
   * failing on save.
   */
  file?: { name: string; type: string; dataUrl: string };
  createdAt: number;
  /** Absolute deadline in ms, or null when the teacher has turned it off. */
  dueAt: number | null;
  /**
   * When this was first made visible to learners.
   *
   * Separate from createdAt because they are different events and the gap
   * between them is usually days: a teacher writes a draft on Monday and
   * shares it on Thursday. The unread dot has to watch THIS one -- watching
   * createdAt meant publishing moved nothing the dot compared against, so
   * sharing an assignment never lit anything up.
   *
   * Stamped once, when the status first flips to published, so fixing a typo
   * afterwards does not re-notify the whole class.
   */
  publishedAt?: number;
  updatedAt?: number;
}

/**
 * One learner's answer. Id is `{assignmentId}__{uid}`, the same shape as
 * progress records, so a learner can only ever have one per assignment and
 * the document name itself carries who it belongs to.
 */
export interface SubmissionDoc {
  id: string;
  assignmentId: string;
  uid: string;
  displayName: string;
  code: string;
  note?: string;
  submittedAt: number;
  /**
   * Whether it arrived after the deadline.
   *
   * Written by the client and VERIFIED BY THE SECURITY RULE against
   * request.time, which is the server's clock. A browser-side check alone is
   * worth nothing -- moving the system clock back is a two-click bypass. The
   * rule does not refuse a late submission, it only refuses to let one call
   * itself punctual.
   */
  late: boolean;
  /** The teacher's reply. Only an admin can write this. */
  feedback?: string;
  reviewedAt?: number;
}

/** Late is a question about one instant against another, and nothing else. */
export function isLateAt(dueAt: number | null, at: number): boolean {
  return dueAt !== null && at > dueAt;
}

/** The default the teacher gets, and can turn off: 24 hours from now. */
export const DEFAULT_HOMEWORK_WINDOW_MS = 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------ discussion */

/**
 * One message in the shared discussion area.
 *
 * The reply context is COPIED IN (`replyToName`, `replyToExcerpt`) rather
 * than looked up from the parent. A quoted line that still reads correctly
 * after the original is deleted is worth more than a live reference that
 * turns into a dangling id -- and moderation means messages really do get
 * deleted, so dangling ids are the normal case, not the edge one.
 */
export interface DiscussionMessage {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  at: number;
  replyTo?: string;
  replyToName?: string;
  replyToExcerpt?: string;
}
