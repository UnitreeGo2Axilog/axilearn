"use client";

/**
 * Save this lesson for later -- the "savepoint" a learner leaves for
 * themselves before closing the tab.
 *
 * Not the same thing as completion, and deliberately unrelated to it. Done
 * means "I finished this"; saved means "I want to find this again", which is
 * just as often a lesson already finished and worth re-reading as one
 * abandoned halfway.
 */
import { Bookmark } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useBookmarks } from "@/lib/bookmarks-context";
import { Tooltip } from "@/components/tooltip";
import { useT } from "@/i18n/use-t";

export function BookmarkButton({ lessonId, accent }: { lessonId: string; accent: string }) {
  const t = useT();
  const { user } = useAuth();
  const { isBookmarked, toggle } = useBookmarks();

  if (!user) return null;
  const saved = isBookmarked(lessonId);
  const label = saved ? t("bookmarks.remove") : t("bookmarks.add");

  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={() => void toggle(lessonId)}
        aria-pressed={saved}
        aria-label={label}
        className="grid h-8 w-8 place-items-center rounded-lg border transition hover:opacity-80"
        style={{
          borderColor: saved ? accent : "var(--border-strong)",
          background: saved ? `color-mix(in srgb, ${accent} 14%, transparent)` : "transparent",
          color: saved ? accent : "var(--text-faint)",
        }}
      >
        <Bookmark className="h-4 w-4" fill={saved ? accent : "none"} />
      </button>
    </Tooltip>
  );
}
