"use client";

/**
 * Saved lessons -- the learner's own list of places to come back to.
 *
 * A bookmark is stored as a bare lesson id, so the title and the track it
 * belongs to are looked up here from the tracks the server sent. That also
 * handles a lesson being deleted or unpublished in the CMS: the id no longer
 * resolves, and it is simply dropped rather than rendering a row that leads
 * nowhere.
 */
import { LiveBackground } from "@/components/live-background";
import Link from "next/link";
import { BookMarked } from "lucide-react";
import type { Level, RoadmapTrack } from "@/content/roadmap-data";
import { useBookmarks } from "@/lib/bookmarks-context";
import { useProgress } from "@/lib/progress-context";
import { useLocale, useT } from "@/i18n/use-t";

export function BookmarksView({ tracks }: { tracks: RoadmapTrack[] }) {
  const t = useT();
  const locale = useLocale();
  const { ids, loading } = useBookmarks();
  const { completedIds } = useProgress();

  const saved: { level: Level; track: RoadmapTrack }[] = [];
  for (const track of tracks) {
    for (const level of track.levels) {
      if (ids.has(level.id)) saved.push({ level, track });
    }
  }

  return (
    <>
      <LiveBackground />
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-strong">
          <BookMarked className="h-7 w-7" style={{ color: "var(--neon)" }} />
          {t("nav.bookmarks")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{t("bookmarks.subtitle")}</p>
      </header>

      {loading ? (
        <p className="text-sm text-faint">…</p>
      ) : saved.length === 0 ? (
        <div className="panel rounded-2xl p-6 text-center">
          <p className="text-sm leading-relaxed text-muted">{t("bookmarks.empty")}</p>
          <Link
            href={`/${locale}`}
            className="btn-neon mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-bold"
          >
            {t("bookmarks.browse")}
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {saved.map(({ level, track }) => (
            <Link
              key={level.id}
              href={`/${locale}/lesson/${level.id}`}
              className="panel block rounded-2xl p-4 transition hover:opacity-90"
            >
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span
                  className="rounded-md px-2 py-0.5 font-robot text-[10px] font-bold tracking-[0.18em]"
                  style={{
                    background: `color-mix(in srgb, ${track.color} 16%, transparent)`,
                    color: track.color,
                  }}
                >
                  {track.short}
                </span>
                <span className="flex-1 truncate text-sm font-bold text-main">{level.title}</span>
                {completedIds.has(level.id) && (
                  <span className="shrink-0 text-[11px] font-bold" style={{ color: "var(--cleared)" }}>
                    {t("lesson.completed")}
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-muted">{level.shortDescription}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
