"use client";

/**
 * Track editor: the briefing learners read, plus the ordered list of lessons.
 *
 * The lesson list is where map layout is decided. There are no coordinate
 * fields anywhere in this CMS -- move a lesson up or down and its hexagon moves
 * with it, because `layout()` derives positions from order. Asking a teacher to
 * think in percentages was never going to survive contact with real use.
 *
 * The route `/admin/track/new` renders the same form against a blank track.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Compass,
  Plus,
  Save,
  Swords,
  Trash2,
} from "lucide-react";
import {
  deleteLesson,
  deleteTrackDoc,
  moveLesson,
  readTrackDoc,
  saveTrackDoc,
} from "@/content/admin-content";
import { emptyTrackDoc, type TrackDoc } from "@/content/schema";
import {
  AdminBack,
  AdminGuard,
  Field,
  L10nInput,
  L10nListInput,
  SaveState,
  StatusChip,
  StatusToggle,
  TextInput,
} from "@/components/admin/admin-shell";
import { Tooltip } from "@/components/tooltip";
import { useLocale, useT } from "@/i18n/use-t";

export default function AdminTrackPage() {
  return (
    <AdminGuard>
      <TrackEditor />
    </AdminGuard>
  );
}

/** Ids end up in URLs, so keep them to what a URL can carry. */
function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function TrackEditor() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ trackId: string }>();
  const trackId = params?.trackId ?? "";
  const isNew = trackId === "new";

  const [track, setTrack] = useState<TrackDoc | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (isNew) {
      setTrack(emptyTrackDoc("", 99));
      return;
    }
    try {
      const doc = await readTrackDoc(trackId);
      if (!doc) setError(`Track "${trackId}" not found`);
      setTrack(doc ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [isNew, trackId]);

  useEffect(() => {
    void load();
  }, [load]);

  function edit(patch: Partial<TrackDoc>) {
    setTrack((prev) => (prev ? { ...prev, ...patch } : prev));
    setState("idle");
  }
  function editOverview(patch: Partial<TrackDoc["overview"]>) {
    setTrack((prev) => (prev ? { ...prev, overview: { ...prev.overview, ...patch } } : prev));
    setState("idle");
  }

  async function save() {
    if (!track) return;
    const id = slug(track.id);
    if (!id) {
      setError(t("admin.idRequired"));
      return;
    }
    if (!track.title.en.trim()) {
      setError(t("admin.titleRequired"));
      return;
    }
    setState("saving");
    setError(null);
    try {
      await saveTrackDoc({ ...track, id });
      setState("saved");
      if (isNew) router.replace(`/${locale}/admin/track/${id}`);
    } catch (err) {
      setState("idle");
      setError((err as Error).message);
    }
  }

  async function removeTrack() {
    if (!track || isNew) return;
    if (!window.confirm(t("admin.confirmDeleteTrack"))) return;
    await deleteTrackDoc(track.id);
    router.push(`/${locale}/admin`);
  }

  async function move(lessonId: string, direction: -1 | 1) {
    if (!track || isNew) return;
    await moveLesson(track.id, lessonId, direction);
    await load();
  }

  async function removeLesson(lessonId: string) {
    if (!track || isNew) return;
    if (!window.confirm(t("admin.confirmDeleteLesson"))) return;
    await deleteLesson(track.id, lessonId);
    await load();
  }

  if (!track) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <AdminBack href="/admin" label={t("admin.backToAdmin")} />
        {error && (
          <p className="text-sm" style={{ color: "var(--reward)" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  const lessons = [...(track.lessons ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-8">
      <AdminBack href="/admin" label={t("admin.backToAdmin")} />

      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="flex-1 text-2xl font-extrabold text-strong">
          {isNew ? t("admin.newTrack") : t("admin.editTrack")}
        </h1>
        <StatusToggle status={track.status} onChange={(status) => edit({ status })} />
      </header>

      {/* identity ------------------------------------------------------- */}
      <section className="panel mb-5 space-y-4 rounded-2xl p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-faint">
          {t("admin.identity")}
        </h2>

        <Field label={t("admin.trackId")} hint={t("admin.trackIdHint")}>
          <TextInput
            value={track.id}
            disabled={!isNew}
            placeholder="physical-ai"
            onChange={(e) => edit({ id: e.target.value })}
          />
        </Field>

        <L10nInput
          label={t("admin.trackTitle")}
          value={track.title}
          onChange={(title) => edit({ title })}
        />
        <L10nInput
          label={t("admin.trackDescription")}
          value={track.description}
          rows={2}
          onChange={(description) => edit({ description })}
        />
      </section>

      {/* appearance ----------------------------------------------------- */}
      <section className="panel mb-5 space-y-4 rounded-2xl p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-faint">
          {t("admin.appearance")}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("admin.short")} hint={t("admin.shortHint")}>
            <TextInput
              value={track.short}
              onChange={(e) => edit({ short: e.target.value.toUpperCase() })}
            />
          </Field>
          <Field label={t("admin.color")}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={track.color}
                onChange={(e) => edit({ color: e.target.value, glow: hexToRgb(e.target.value) })}
                className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />
              <TextInput
                value={track.color}
                onChange={(e) => edit({ color: e.target.value, glow: hexToRgb(e.target.value) })}
              />
            </div>
          </Field>
        </div>

        <div className="space-y-2 pt-1">
          <Checkbox
            checked={track.comingSoon === true}
            onChange={(comingSoon) => edit({ comingSoon })}
            label={t("admin.comingSoonLabel")}
          />
          <Checkbox
            checked={track.hidden === true}
            onChange={(hidden) => edit({ hidden })}
            label={t("admin.hiddenLabel")}
          />
        </div>
      </section>

      {/* briefing ------------------------------------------------------- */}
      <section className="panel mb-5 space-y-5 rounded-2xl p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-faint">
          {t("admin.briefing")}
        </h2>
        <L10nInput
          label={t("admin.tagline")}
          value={track.overview.tagline}
          rows={2}
          onChange={(tagline) => editOverview({ tagline })}
        />
        <L10nInput
          label={t("admin.forWho")}
          value={track.overview.forWho}
          rows={2}
          onChange={(forWho) => editOverview({ forWho })}
        />
        <L10nListInput
          label={t("admin.outcomes")}
          items={track.overview.outcomes ?? []}
          rows={2}
          onChange={(outcomes) => editOverview({ outcomes })}
        />
        <L10nListInput
          label={t("admin.advice")}
          items={track.overview.advice ?? []}
          rows={2}
          onChange={(advice) => editOverview({ advice })}
        />
      </section>

      {/* save bar ------------------------------------------------------- */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
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
            onClick={removeTrack}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: "var(--reward)" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("admin.delete")}
          </button>
        )}
      </div>

      {/* lessons -------------------------------------------------------- */}
      {!isNew && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-strong">
              <BookOpen className="h-5 w-5" style={{ color: track.color }} />
              {lessons.length} {t("admin.lessons")}
            </h2>
            <Link
              href={`/${locale}/admin/track/${track.id}/lesson/new`}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black"
              style={{ background: track.color, color: "var(--surface-solid)" }}
            >
              <Plus className="h-3.5 w-3.5" />
              {t("admin.newLesson")}
            </Link>
          </div>
          <p className="mb-3 text-[11px] text-faint">{t("admin.orderHint")}</p>

          {lessons.length === 0 ? (
            <p className="panel rounded-xl p-4 text-sm text-muted">{t("admin.noLessons")}</p>
          ) : (
            <ol className="space-y-2">
              {lessons.map((lesson, i) => (
                <li
                  key={lesson.id}
                  className="panel flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl p-3"
                >
                  <span className="font-robot text-[11px] font-bold text-faint">{i + 1}</span>
                  {lesson.section && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold"
                      style={{ color: track.color }}
                    >
                      <Compass className="h-3 w-3" />
                      {lesson.section}
                    </span>
                  )}
                  <Link
                    href={`/${locale}/admin/track/${track.id}/lesson/${lesson.id}`}
                    className="min-w-[140px] flex-1 text-sm font-bold text-main hover:opacity-80"
                  >
                    {lesson.title?.en || lesson.id}
                  </Link>
                  <StatusChip status={lesson.status} />
                  <span className="text-[11px] font-semibold text-faint">
                    {lesson.xpReward} XP · {lesson.durationMinutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <IconButton
                      label={t("admin.moveUp")}
                      disabled={i === 0}
                      onClick={() => void move(lesson.id, -1)}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      label={t("admin.moveDown")}
                      disabled={i === lessons.length - 1}
                      onClick={() => void move(lesson.id, 1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      label={t("admin.delete")}
                      onClick={() => void removeLesson(lesson.id)}
                      danger
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {/* challenges -- managed on their own page, since difficulty grouping
          and per-question editing does not fit the lesson list's shape */}
      {!isNew && (
        <Link
          href={`/${locale}/admin/track/${track.id}/challenges`}
          className="panel mt-6 flex items-center gap-3 rounded-xl p-4 transition hover:opacity-90"
        >
          <Swords className="h-5 w-5" style={{ color: "var(--reward)" }} />
          <span className="flex-1 text-sm font-bold text-main">{t("admin.challenges")}</span>
          <ArrowRight className="h-4 w-4 text-faint" />
        </Link>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- helpers */

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-main">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--neon)]"
      />
      {label}
    </label>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const button = (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-7 w-7 place-items-center rounded-lg border transition disabled:opacity-30"
      style={{
        borderColor: "var(--border)",
        color: danger ? "var(--reward)" : "var(--text-muted)",
      }}
    >
      {children}
    </button>
  );
  return disabled ? button : <Tooltip label={label}>{button}</Tooltip>;
}

/** The map's glow is an "r,g,b" string, so keep it in step with the colour. */
function hexToRgb(hex: string): string {
  const m = hex.replace("#", "").match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return "34,211,238";
  return `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}`;
}
