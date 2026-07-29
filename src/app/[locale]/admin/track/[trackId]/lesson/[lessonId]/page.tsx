"use client";

/**
 * Lesson editor.
 *
 * Two things it deliberately does NOT have:
 *
 *  - A map position. Where the node sits comes from the lesson's place in the
 *    track's list, so reordering is the only "layout" control that exists.
 *  - A video upload. Free hosting has no room for video files, so a lesson
 *    carries a YouTube ID and we embed it. Paste any form of YouTube link and
 *    the ID is pulled out of it.
 *
 * The lesson's long text is saved to its own document so the track document
 * stays small enough to serve a whole map in a single read.
 */
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlayCircle, Save, Trash2 } from "lucide-react";
import {
  deleteLesson,
  readLessonBody,
  readTrackDoc,
  saveLesson,
  saveLessonBody,
} from "@/content/admin-content";
import {
  emptyLessonEntry,
  youTubeId,
  type L10n,
  type LessonEntry,
  type TrackDoc,
} from "@/content/schema";
import {
  AdminBack,
  AdminGuard,
  Field,
  L10nInput,
  SaveState,
  StatusToggle,
  TextInput,
} from "@/components/admin/admin-shell";
import { useLocale, useT } from "@/i18n/use-t";

const TYPES = ["lesson", "checkpoint", "project", "final_project"] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export default function AdminLessonPage() {
  return (
    <AdminGuard>
      <LessonEditor />
    </AdminGuard>
  );
}

function LessonEditor() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ trackId: string; lessonId: string }>();
  const trackId = params?.trackId ?? "";
  const lessonId = params?.lessonId ?? "";
  const isNew = lessonId === "new";

  const [track, setTrack] = useState<TrackDoc | null>(null);
  const [lesson, setLesson] = useState<LessonEntry | null>(null);
  const [body, setBody] = useState<L10n>({ en: "" });
  const [videoInput, setVideoInput] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const doc = await readTrackDoc(trackId);
      setTrack(doc);
      if (!doc) {
        setError(`Track "${trackId}" not found`);
        return;
      }
      if (isNew) {
        setLesson(emptyLessonEntry("", (doc.lessons ?? []).length));
        return;
      }
      const hit = (doc.lessons ?? []).find((l) => l.id === lessonId);
      if (!hit) {
        setError(`Lesson "${lessonId}" not found`);
        return;
      }
      setLesson(hit);
      setVideoInput(hit.videoId ?? "");
      setBody(await readLessonBody(trackId, hit.id));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [trackId, isNew, lessonId]);

  useEffect(() => {
    void load();
  }, [load]);

  function edit(patch: Partial<LessonEntry>) {
    setLesson((prev) => (prev ? { ...prev, ...patch } : prev));
    setState("idle");
  }

  const videoId = youTubeId(videoInput);

  async function save() {
    if (!lesson || !track) return;
    const id = slug(lesson.id || lesson.title.en);
    if (!id) {
      setError(t("admin.idRequired"));
      return;
    }
    if (!lesson.title.en.trim()) {
      setError(t("admin.titleRequired"));
      return;
    }
    if (isNew && (track.lessons ?? []).some((l) => l.id === id)) {
      setError(t("admin.lessonIdTaken"));
      return;
    }
    if (videoInput.trim() && !videoId) {
      setError(t("admin.videoBad"));
      return;
    }

    setState("saving");
    setError(null);
    try {
      const entry: LessonEntry = { ...lesson, id, ...(videoId ? { videoId } : {}) };
      if (!videoId) delete entry.videoId;
      await saveLesson(trackId, entry);
      await saveLessonBody(trackId, id, body, entry.status);
      setState("saved");
      if (isNew) router.replace(`/${locale}/admin/track/${trackId}/lesson/${id}`);
    } catch (err) {
      setState("idle");
      setError((err as Error).message);
    }
  }

  async function remove() {
    if (!lesson || isNew) return;
    if (!window.confirm(t("admin.confirmDeleteLesson"))) return;
    await deleteLesson(trackId, lesson.id);
    router.push(`/${locale}/admin/track/${trackId}`);
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <AdminBack href={`/admin/track/${trackId}`} label={t("admin.backToTrack")} />
        {error && (
          <p className="text-sm" style={{ color: "var(--reward)" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-8">
      <AdminBack href={`/admin/track/${trackId}`} label={t("admin.backToTrack")} />

      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="flex-1 text-2xl font-extrabold text-strong">
          {isNew ? t("admin.newLesson") : t("admin.editLesson")}
        </h1>
        <StatusToggle status={lesson.status} onChange={(status) => edit({ status })} />
      </header>

      {/* details -------------------------------------------------------- */}
      <section className="panel mb-5 space-y-4 rounded-2xl p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-faint">
          {t("admin.lessonMeta")}
        </h2>

        <Field label="ID" hint={t("admin.trackIdHint")}>
          <TextInput
            value={lesson.id}
            disabled={!isNew}
            placeholder="ph-1"
            onChange={(e) => edit({ id: e.target.value })}
          />
        </Field>

        <L10nInput
          label={t("admin.trackTitle")}
          value={lesson.title}
          onChange={(title) => edit({ title })}
        />
        <L10nInput
          label={t("admin.trackDescription")}
          value={lesson.shortDescription}
          rows={2}
          onChange={(shortDescription) => edit({ shortDescription })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("admin.type")}>
            <select
              value={lesson.type}
              onChange={(e) => edit({ type: e.target.value as LessonEntry["type"] })}
              className="field w-full rounded-xl px-3 py-2.5 text-sm"
            >
              {TYPES.map((x) => (
                <option key={x} value={x}>
                  {x.replace("_", " ")}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("admin.difficulty")}>
            <select
              value={lesson.difficulty}
              onChange={(e) => edit({ difficulty: e.target.value as LessonEntry["difficulty"] })}
              className="field w-full rounded-xl px-3 py-2.5 text-sm"
            >
              {DIFFICULTIES.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("admin.xp")}>
            <TextInput
              type="number"
              min={0}
              value={lesson.xpReward}
              onChange={(e) => edit({ xpReward: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label={t("admin.minutes")}>
            <TextInput
              type="number"
              min={0}
              value={lesson.durationMinutes}
              onChange={(e) => edit({ durationMinutes: Number(e.target.value) || 0 })}
            />
          </Field>
        </div>

        <Field label={t("admin.skills")} hint={t("admin.skillsHint")}>
          <TextInput
            value={lesson.skills.join(", ")}
            placeholder="sensors, vision"
            onChange={(e) =>
              edit({
                skills: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("admin.badge")}>
            <TextInput
              value={lesson.badge ?? ""}
              placeholder="Reflex Ready"
              onChange={(e) => edit({ badge: e.target.value })}
            />
          </Field>
          <Field label={t("admin.section")} hint={t("admin.sectionHint")}>
            <TextInput
              value={lesson.section ?? ""}
              placeholder="Perception"
              onChange={(e) => edit({ section: e.target.value })}
            />
          </Field>
        </div>
      </section>

      {/* video ---------------------------------------------------------- */}
      <section className="panel mb-5 space-y-3 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-faint">
          <PlayCircle className="h-4 w-4" />
          {t("admin.video")}
        </h2>
        <Field label={t("admin.video")} hint={t("admin.videoHint")}>
          <TextInput
            value={videoInput}
            placeholder="https://youtu.be/…"
            onChange={(e) => {
              setVideoInput(e.target.value);
              setState("idle");
            }}
          />
        </Field>
        {videoInput.trim() &&
          (videoId ? (
            <p className="text-xs font-bold" style={{ color: "var(--cleared)" }}>
              {t("admin.videoOk")} <span className="font-robot">{videoId}</span>
            </p>
          ) : (
            <p className="text-xs font-bold" style={{ color: "var(--reward)" }}>
              {t("admin.videoBad")}
            </p>
          ))}
      </section>

      {/* body ----------------------------------------------------------- */}
      <section className="panel mb-5 space-y-3 rounded-2xl p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-faint">
          {t("admin.lessonBody")}
        </h2>
        <p className="text-[11px] text-faint">{t("admin.lessonBodyHint")}</p>
        <L10nInput
          label={t("admin.lessonBody")}
          value={body}
          rows={10}
          onChange={(next) => {
            setBody(next);
            setState("idle");
          }}
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={state === "saving"}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black disabled:opacity-50"
          style={{ background: "var(--neon)", color: "var(--surface-solid)" }}
        >
          <Save className="h-4 w-4" />
          {t("admin.save")}
        </button>
        <SaveState state={state} error={error} />
        {!isNew && (
          <button
            onClick={remove}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: "var(--reward)" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("admin.delete")}
          </button>
        )}
      </div>
    </div>
  );
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
