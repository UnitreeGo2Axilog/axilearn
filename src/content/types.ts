/**
 * AxiLearn content model.
 *
 * Follows the tech-spec schema (tracks -> modules -> lessons -> progress) with
 * five additions the spec was missing, all decided with the supervisor's brief
 * and the audio in mind:
 *
 *  1. Every human-readable string is bilingual (`Localized`), because the
 *     platform ships in English and French. Retrofitting this later would mean
 *     rewriting every lesson.
 *  2. Tracks carry a `status`, so ML-AI and Game-Dev can show as "coming soon"
 *     while only Physical AI has content.
 *  3. Lessons carry a `mapPosition`, because the track page is a Kalimat-Crash
 *     style journey map, not a list.
 *  4. Two extra lesson types the spec lacked: `local_setup` (install the
 *     simulator on your own machine) and `sim_viewer` (drive the robot in the
 *     browser).
 *  5. Points and badges, for the gamification layer.
 *
 * Validation note: the spec stored `solution_code` and compared it to the
 * student's code. That rejects correct answers written differently, so lessons
 * here declare `checks` against the RESULT of running the code instead.
 */

export type Locale = "en" | "fr";

/** A string that exists in both site languages. */
export type Localized = Record<Locale, string>;

export type TrackId = "physical-ai" | "ml-ai" | "game-dev";

export type TrackStatus = "active" | "coming_soon";

export type LessonType =
  | "text_video" // reading + an embedded video
  | "python_sandbox" // write Python, run it in the browser
  | "local_setup" // install something on your own computer
  | "sim_viewer" // watch/drive the robot simulation
  | "quiz";

export interface Track {
  id: TrackId;
  order: number;
  status: TrackStatus;
  title: Localized;
  description: Localized;
  /** Tailwind-friendly accent colour, used on the card and the map. */
  color: string;
  /** lucide-react icon name, e.g. "Bot". */
  icon: string;
}

export interface Module {
  id: string;
  trackId: TrackId;
  order: number;
  title: Localized;
  /** Colour for this chapter's nodes on the journey map. */
  color: string;
}

/** How a `python_sandbox` exercise is marked correct. */
export interface LessonCheck {
  /** Text the student's program must print (trimmed, case-insensitive). */
  expectedOutput?: string;
  /** Substrings the output must contain. */
  outputContains?: string[];
  /** Friendly hint shown when the check fails. */
  hint: Localized;
}

export interface Lesson {
  id: string;
  moduleId: string;
  trackId: TrackId;
  order: number;
  type: LessonType;
  title: Localized;
  /** Markdown body shown in the instructions pane. */
  body: Localized;
  /** Starter code for sandbox lessons. */
  initialCode?: string;
  checks?: LessonCheck[];
  /** Unlisted YouTube id for text_video lessons (never self-host video). */
  videoId?: string;
  points: number;
  /** Where this lesson's node sits on the journey map (0-100, % of the canvas). */
  mapPosition: { x: number; y: number };
}

export interface UserProgress {
  uid: string;
  trackId: TrackId;
  completedLessons: string[];
  currentLessonId: string | null;
  score: number;
  badges: string[];
}

/** Pick the right language, falling back to English if a translation is missing. */
export function t(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value.en || "";
}
