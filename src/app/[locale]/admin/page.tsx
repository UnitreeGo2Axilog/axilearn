"use client";

/**
 * The CMS entry point: every track, its size, and whether learners can see it.
 *
 * Reads come from the client SDK rather than the server store, because the
 * admin is signed in and therefore allowed to see DRAFTS -- the public reads
 * deliberately cannot.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Download, LayoutDashboard, Plus, RefreshCw, Users } from "lucide-react";
import {
  importStarterContent,
  listTrackDocs,
  type ImportResult,
} from "@/content/admin-content";
import type { TrackDoc } from "@/content/schema";
import { AdminGuard, StatusChip } from "@/components/admin/admin-shell";
import { Tooltip } from "@/components/tooltip";
import { useLocale, useT } from "@/i18n/use-t";

export default function AdminPage() {
  return (
    <AdminGuard>
      <Dashboard />
    </AdminGuard>
  );
}

function Dashboard() {
  const t = useT();
  const locale = useLocale();
  const [tracks, setTracks] = useState<TrackDoc[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTracks(await listTrackDocs());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setTracks([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runImport() {
    setBusy(true);
    setError(null);
    try {
      setResult(await importStarterContent());
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4 pb-20 pt-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 text-3xl font-extrabold text-strong">
          <LayoutDashboard className="h-7 w-7" style={{ color: "var(--advanced)" }} />
          {t("admin.dashboard")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{t("admin.intro")}</p>
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

      {/* the other half of the job: the people, not the content */}
      <Link
        href={`/${locale}/admin/students`}
        className="panel mb-6 flex flex-wrap items-center gap-3 rounded-2xl p-5 transition hover:opacity-90"
      >
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
          style={{
            background: "color-mix(in srgb, var(--neon) 16%, transparent)",
            color: "var(--neon)",
          }}
        >
          <Users className="h-5 w-5" />
        </span>
        <span className="min-w-[200px] flex-1">
          <span className="block text-sm font-extrabold text-strong">
            {t("admin.openStudents")}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-muted">
            {t("admin.studentsIntro")}
          </span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0" style={{ color: "var(--neon)" }} />
      </Link>

      {/* seed */}
      <section className="panel mb-6 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-[220px] flex-1">
            <h2 className="text-sm font-extrabold text-strong">{t("admin.import")}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">{t("admin.importHint")}</p>
          </div>
          <button
            onClick={runImport}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black disabled:opacity-50"
            style={{ background: "var(--advanced)", color: "var(--surface-solid)" }}
          >
            <Download className="h-4 w-4" />
            {busy ? t("admin.importing") : t("admin.import")}
          </button>
        </div>
        {result && (
          <div className="mt-3 space-y-1 text-xs">
            {result.written.length > 0 && (
              <p style={{ color: "var(--cleared)" }}>
                {t("admin.importDone")} {result.written.join(", ")}
              </p>
            )}
            {result.skipped.length > 0 && (
              <p className="text-faint">
                {t("admin.importSkipped")} {result.skipped.join(", ")}
              </p>
            )}
            {result.bodiesWritten.length > 0 && (
              <p style={{ color: "var(--advanced)" }}>
                {t("admin.importBodies")} {result.bodiesWritten.length}
              </p>
            )}
            {result.tracksRefreshed.length > 0 && (
              <p style={{ color: "var(--advanced)" }}>
                {t("admin.importRefreshed")} {result.tracksRefreshed.join(", ")}
              </p>
            )}
            {result.challengesMoved.length > 0 && (
              <p className="text-faint">
                {t("admin.importMoved")} {result.challengesMoved.length}
              </p>
            )}
            {result.challengesWritten.length > 0 && (
              <p style={{ color: "var(--reward)" }}>
                {t("admin.importChallenges")} {result.challengesWritten.length}
              </p>
            )}
            {result.notificationsWritten.length > 0 && (
              <p style={{ color: "var(--reward)" }}>
                {t("notif.imported")} {result.notificationsWritten.length}
              </p>
            )}
            {result.fieldsBackfilled.length > 0 && (
              <p style={{ color: "var(--neon)" }}>
                {t("admin.importBackfilled")} {result.fieldsBackfilled.length}
              </p>
            )}
          </div>
        )}
      </section>

      {/* tracks */}
      <section className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-strong">{t("admin.tracksHeading")}</h2>
        <div className="flex items-center gap-2">
          <Tooltip label="Refresh">
            <button
              onClick={() => void load()}
              aria-label="Refresh"
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-main"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
          <Link
            href={`/${locale}/admin/track/new`}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black"
            style={{ background: "var(--neon)", color: "var(--surface-solid)" }}
          >
            <Plus className="h-3.5 w-3.5" />
            {t("admin.newTrack")}
          </Link>
        </div>
      </section>

      {tracks === null ? (
        <p className="text-sm text-faint">…</p>
      ) : tracks.length === 0 ? (
        <p className="panel rounded-2xl p-5 text-sm text-muted">{t("admin.noTracks")}</p>
      ) : (
        <div className="space-y-2.5">
          {tracks.map((track) => {
            const lessons = track.lessons ?? [];
            const drafts = lessons.filter((l) => l.status === "draft").length;
            const chapters = lessons.filter((l) => l.section).length;
            return (
              <Link
                key={track.id}
                href={`/${locale}/admin/track/${track.id}`}
                className="panel block rounded-xl p-4 transition hover:opacity-90"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span
                    className="rounded-md px-2 py-0.5 font-robot text-[10px] font-bold tracking-[0.18em]"
                    style={{
                      background: `color-mix(in srgb, ${track.color} 16%, transparent)`,
                      color: track.color,
                    }}
                  >
                    {track.short}
                  </span>
                  <span className="flex-1 text-sm font-bold text-main">
                    {track.title?.en || track.id}
                  </span>
                  <StatusChip status={track.status} />
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-faint">
                    <BookOpen className="h-3.5 w-3.5" />
                    {lessons.length} {t("admin.lessons")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-faint">
                    <Compass className="h-3.5 w-3.5" />
                    {chapters}
                  </span>
                  {drafts > 0 && (
                    <span className="text-xs font-bold" style={{ color: "var(--reward)" }}>
                      {drafts} {t("admin.draft").toLowerCase()}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
