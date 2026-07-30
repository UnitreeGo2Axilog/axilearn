"use client";

/**
 * The teaching side of the platform: who is enrolled, what they have done, and
 * who is on the site right now.
 *
 * Three deliberate choices:
 *
 *  - Remarks live in their own admin-only collection, never on the learner's
 *    document. A learner can read their own document, and "struggling, call
 *    home" must not be one click away from the person it is about.
 *  - "Needs a nudge" is computed, not entered. A teacher should not have to
 *    scan dates to notice that somebody quietly stopped a fortnight ago.
 *  - Presence is a heartbeat on the learner's own document, written at most
 *    once every four minutes, because writes are the scarcer free-tier quota.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Circle,
  Download,
  RefreshCw,
  Search,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { listTrackDocs } from "@/content/admin-content";
import type { TrackDoc } from "@/content/schema";
import {
  fetchAllNotes,
  fetchAllProgress,
  fetchAllStudents,
  isOnline,
  saveNote,
  statsFor,
  STUCK_AFTER_MS,
  type ProgressRecord,
  type StaffNote,
  type StudentRow,
} from "@/lib/progress";
import { AdminBack, AdminGuard } from "@/components/admin/admin-shell";
import { useLocale, useT } from "@/i18n/use-t";

type SortKey = "name" | "progress" | "activity";

export default function AdminStudentsPage() {
  return (
    <AdminGuard>
      <Students />
    </AdminGuard>
  );
}

function Students() {
  const t = useT();
  const locale = useLocale();

  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [notes, setNotes] = useState<Record<string, StaffNote>>({});
  const [tracks, setTracks] = useState<TrackDoc[]>([]);
  const [error, setError] = useState<string | null>(null);
  /** Remarks live in a collection added after the first rules deploy, so it is
      the one read most likely to be denied. It must not take the roster down. */
  const [notesBlocked, setNotesBlocked] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("activity");
  const [open, setOpen] = useState<string | null>(null);
  /** A ticking clock, so "online now" and "2 minutes ago" stay true while the
      page is open -- and so nothing has to read the clock during render. */
  const [now, setNow] = useState(0);

  const load = useCallback(async () => {
    try {
      const [s, p, tr] = await Promise.all([
        fetchAllStudents(),
        fetchAllProgress(),
        listTrackDocs(),
      ]);
      setStudents(s);
      setProgress(p);
      setTracks(tr);
      setError(null);

      try {
        setNotes(await fetchAllNotes());
        setNotesBlocked(false);
      } catch {
        setNotesBlocked(true);
      }
    } catch (err) {
      setError((err as Error).message);
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const totalLessons = useMemo(
    () =>
      tracks.reduce(
        (sum, tr) => sum + (tr.lessons ?? []).filter((l) => l.status === "published").length,
        0,
      ),
    [tracks],
  );

  const rows = useMemo(() => {
    const learners = (students ?? []).filter((s) => s.role === "student");
    const withStats = learners.map((s) => ({ student: s, stats: statsFor(s.uid, progress) }));

    const needle = search.trim().toLowerCase();
    const filtered = needle
      ? withStats.filter(
          (r) =>
            r.student.displayName.toLowerCase().includes(needle) ||
            (r.student.email ?? "").toLowerCase().includes(needle),
        )
      : withStats;

    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.student.displayName.localeCompare(b.student.displayName);
      if (sort === "progress") return b.stats.completed - a.stats.completed;
      return (b.student.lastSeenAt ?? 0) - (a.student.lastSeenAt ?? 0);
    });
  }, [students, progress, search, sort]);

  const admins = (students ?? []).filter((s) => s.role === "admin").length;
  const onlineCount = rows.filter((r) => isOnline(r.student.lastSeenAt, now)).length;
  const startOfDay = new Date(now).setHours(0, 0, 0, 0);
  const activeToday = rows.filter(
    (r) => (r.student.lastSeenAt ?? 0) >= startOfDay || (r.stats.lastActivity ?? 0) >= startOfDay,
  ).length;

  function exportCsv() {
    const header = ["name", "email", "lessons_done", "xp", "last_seen", "joined", "remark"];
    const lines = rows.map((r) =>
      [
        r.student.displayName,
        r.student.email ?? "",
        String(r.stats.completed),
        String(r.stats.xp),
        r.student.lastSeenAt ? new Date(r.student.lastSeenAt).toISOString() : "",
        r.student.createdAt ? new Date(r.student.createdAt).toISOString() : "",
        (notes[r.student.uid]?.text ?? "").replace(/\s+/g, " "),
      ]
        // Quote everything and double inner quotes -- a remark with a comma
        // would otherwise split into extra columns.
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axilearn-students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-8">
      <AdminBack href="/admin" label={t("admin.backToAdmin")} />

      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 text-3xl font-extrabold text-strong">
          <Users className="h-7 w-7" style={{ color: "var(--neon)" }} />
          {t("admin.students")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t("admin.studentsIntro")}
        </p>
      </header>

      {error && (
        <p
          className="mb-5 rounded-xl border p-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--reward) 40%, transparent)",
            background: "color-mix(in srgb, var(--reward) 10%, transparent)",
            color: "var(--reward)",
          }}
        >
          {error}
        </p>
      )}

      {notesBlocked && (
        <p
          className="mb-5 rounded-xl border p-3 text-xs leading-relaxed"
          style={{
            borderColor: "color-mix(in srgb, var(--reward) 35%, transparent)",
            background: "color-mix(in srgb, var(--reward) 8%, transparent)",
            color: "var(--reward)",
          }}
        >
          {t("admin.notesBlocked")}
        </p>
      )}

      {/* the four numbers a teacher actually opens this page for */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Users} label={t("admin.totalStudents")} value={rows.length} color="var(--neon)" />
        <Stat
          icon={Circle}
          label={t("admin.onlineNow")}
          value={onlineCount}
          color="var(--cleared)"
        />
        <Stat
          icon={Trophy}
          label={t("admin.activeToday")}
          value={activeToday}
          color="var(--reward)"
        />
        <Stat
          icon={Zap}
          label={t("admin.completions")}
          value={progress.length}
          color="var(--advanced)"
        />
      </section>

      {/* controls */}
      <section className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--text-faint)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.searchStudents")}
            className="field w-full rounded-xl py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="field rounded-xl px-3 py-2.5 text-sm"
          aria-label={t("admin.sortBy")}
        >
          <option value="activity">{t("admin.sortActivity")}</option>
          <option value="progress">{t("admin.sortProgress")}</option>
          <option value="name">{t("admin.sortName")}</option>
        </select>
        <button
          onClick={() => void load()}
          className="grid h-10 w-10 place-items-center rounded-xl border text-main"
          style={{ borderColor: "var(--border-strong)" }}
          aria-label="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold text-main disabled:opacity-40"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <Download className="h-3.5 w-3.5" />
          {t("admin.exportCsv")}
        </button>
      </section>

      {/* roster */}
      {students === null ? (
        <p className="text-sm text-faint">…</p>
      ) : rows.length === 0 ? (
        <p className="panel rounded-2xl p-5 text-sm text-muted">{t("admin.noStudents")}</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map(({ student, stats }) => {
            const online = isOnline(student.lastSeenAt, now);
            const stuck =
              stats.completed > 0 &&
              stats.lastActivity != null &&
              now - stats.lastActivity > STUCK_AFTER_MS;
            const pct = totalLessons ? Math.round((stats.completed / totalLessons) * 100) : 0;
            const isOpen = open === student.uid;

            return (
              <div key={student.uid} className="panel rounded-xl">
                <button
                  onClick={() => setOpen(isOpen ? null : student.uid)}
                  className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 p-4 text-left"
                >
                  {/* presence */}
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black"
                    style={{
                      background: online
                        ? "color-mix(in srgb, var(--cleared) 20%, transparent)"
                        : "var(--bg-2)",
                      color: online ? "var(--cleared)" : "var(--text-faint)",
                    }}
                  >
                    {student.displayName.slice(0, 1).toUpperCase()}
                  </span>

                  <span className="min-w-[140px] flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold text-main">{student.displayName}</span>
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: online ? "var(--cleared)" : "var(--text-faint)" }}
                      >
                        <Circle
                          className="h-2 w-2"
                          fill="currentColor"
                          strokeWidth={0}
                        />
                        {online ? t("admin.online") : t("admin.offline")}
                      </span>
                    </span>
                    <span className="block text-[11px] text-faint">{student.email}</span>
                  </span>

                  {stuck && (
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                      style={{
                        background: "color-mix(in srgb, var(--reward) 16%, transparent)",
                        color: "var(--reward)",
                      }}
                      title={t("admin.stuckHint")}
                    >
                      {t("admin.stuck")}
                    </span>
                  )}

                  {/* progress */}
                  <span className="w-32 shrink-0">
                    <span className="mb-1 flex items-baseline justify-between text-[10px] font-bold">
                      <span className="text-faint">
                        {stats.completed}/{totalLessons || "—"}
                      </span>
                      <span style={{ color: "var(--neon)" }}>{pct}%</span>
                    </span>
                    <span
                      className="block h-1.5 w-full overflow-hidden rounded-full"
                      style={{ background: "color-mix(in srgb, var(--text) 14%, transparent)" }}
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${pct}%`, background: "var(--neon)" }}
                      />
                    </span>
                  </span>

                  <span
                    className="w-14 shrink-0 text-right font-robot text-sm font-bold"
                    style={{ color: "var(--reward)" }}
                  >
                    {stats.xp}
                  </span>

                  <span className="w-24 shrink-0 text-right text-[11px] text-faint">
                    {ago(student.lastSeenAt, locale, t("admin.never"), now)}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: "var(--text-faint)" }}
                  />
                </button>

                {isOpen && (
                  <StudentDetail
                    student={student}
                    perTrack={stats.perTrack}
                    lastActivity={stats.lastActivity}
                    tracks={tracks}
                    now={now}
                    note={notes[student.uid]?.text ?? ""}
                    onSaved={(text) =>
                      setNotes((prev) => ({
                        ...prev,
                        [student.uid]: { uid: student.uid, text, updatedAt: Date.now() },
                      }))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-5 text-[11px] text-faint">
        {t("admin.progressNote")}
        {admins > 0 && ` · ${admins} ${t("admin.adminRow").toLowerCase()}`}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- details */

function StudentDetail({
  student,
  perTrack,
  lastActivity,
  tracks,
  now,
  note,
  onSaved,
}: {
  student: StudentRow;
  perTrack: Record<string, number>;
  lastActivity: number | null;
  tracks: TrackDoc[];
  now: number;
  note: string;
  onSaved: (text: string) => void;
}) {
  const t = useT();
  const locale = useLocale();
  const [text, setText] = useState(note);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  async function save() {
    setState("saving");
    try {
      await saveNote(student.uid, text);
      onSaved(text);
      setState("saved");
    } catch {
      setState("idle");
    }
  }

  return (
    <div
      className="space-y-4 border-t p-4"
      style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
    >
      {/* per-track */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-faint">
          {t("admin.perTrack")}
        </p>
        <div className="space-y-1.5">
          {tracks
            .filter((tr) => !tr.hidden || (perTrack[tr.id] ?? 0) > 0)
            .map((tr) => {
              const total = (tr.lessons ?? []).filter((l) => l.status === "published").length;
              const done = perTrack[tr.id] ?? 0;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <div key={tr.id} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-20 shrink-0 font-robot text-[10px] font-bold tracking-wider"
                    style={{ color: tr.color }}
                  >
                    {tr.short}
                  </span>
                  <span
                    className="h-1.5 flex-1 overflow-hidden rounded-full"
                    style={{ background: "color-mix(in srgb, var(--text) 12%, transparent)" }}
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${pct}%`, background: tr.color }}
                    />
                  </span>
                  <span className="w-16 shrink-0 text-right font-semibold text-faint">
                    {done}/{total}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* facts */}
      <dl className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
        <Row label={t("admin.colJoined")} value={ago(student.createdAt, locale, "—", now)} />
        <Row
          label={t("admin.sortActivity")}
          value={ago(lastActivity, locale, t("admin.notStarted"), now)}
        />
        <Row label="Language" value={student.locale.toUpperCase()} />
        <Row label="UID" value={`${student.uid.slice(0, 10)}…`} />
      </dl>

      {/* private remark */}
      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-faint">
          {t("admin.remark")}
        </p>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setState("idle");
          }}
          placeholder={t("admin.remarkPlaceholder")}
          className="field w-full rounded-xl px-3 py-2.5 text-sm"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={save}
            disabled={state === "saving"}
            className="rounded-lg px-3 py-1.5 text-xs font-black disabled:opacity-50"
            style={{ background: "var(--advanced)", color: "var(--surface-solid)" }}
          >
            {t("admin.saveRemark")}
          </button>
          {state === "saved" && (
            <span className="text-xs font-bold" style={{ color: "var(--cleared)" }}>
              {t("admin.remarkSaved")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- helpers */

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="panel rounded-xl p-4 text-center">
      <Icon className="mx-auto h-5 w-5" style={{ color }} />
      <p className="mt-2 font-robot text-xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[11px] font-semibold text-faint">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-faint">{label}</dt>
      <dd className="truncate font-semibold text-main">{value}</dd>
    </div>
  );
}

/**
 * "3 minutes ago" in the admin's own language, via Intl rather than a pile of
 * translated strings for every unit.
 */
function ago(at: number | null, locale: string, fallback: string, now: number): string {
  if (!at || !now) return fallback;
  const seconds = Math.round((at - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 30],
    ["month", 12],
  ];
  let value = seconds;
  for (const [unit, size] of units) {
    if (Math.abs(value) < size) return rtf.format(value, unit);
    value = Math.round(value / size);
  }
  return rtf.format(value, "year");
}
