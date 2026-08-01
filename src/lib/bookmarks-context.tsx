"use client";

/**
 * The learner's saved lessons, fetched once and shared.
 *
 * Same reasoning as ProgressProvider: the star on a lesson, the count in the
 * account menu and the bookmarks page all ask the same question, and asking
 * Firestore three times per navigation buys nothing.
 *
 * Toggling updates local state FIRST and writes after. A star that waits for
 * a network round trip before filling in feels broken, and the failure mode
 * is mild -- the worst case is a save that did not stick, which the next load
 * makes obvious. If the write fails the toggle is rolled back, so the star
 * never claims something Firestore did not accept.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth-context";
import { addBookmark, fetchBookmarks, removeBookmark } from "./bookmarks";

interface BookmarksValue {
  ids: Set<string>;
  loading: boolean;
  isBookmarked: (lessonId: string) => boolean;
  toggle: (lessonId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const BookmarksContext = createContext<BookmarksValue | null>(null);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { user, configured } = useAuth();
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(false);

  const uid = user?.uid ?? null;

  const refresh = useCallback(async () => {
    if (!uid || !configured) {
      setIds(new Set());
      return;
    }
    setLoading(true);
    try {
      setIds(new Set(await fetchBookmarks(uid)));
    } catch {
      // Offline, or the profile document is not there yet. An empty set is
      // the honest answer; nothing on the platform breaks without it.
      setIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [uid, configured]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (lessonId: string) => {
      if (!uid) return;
      const had = ids.has(lessonId);
      const next = new Set(ids);
      if (had) next.delete(lessonId);
      else next.add(lessonId);
      setIds(next); // optimistic

      try {
        if (had) await removeBookmark(uid, lessonId);
        else await addBookmark(uid, lessonId);
      } catch {
        setIds(ids); // put it back rather than lie about what was saved
      }
    },
    [uid, ids],
  );

  const value = useMemo<BookmarksValue>(
    () => ({ ids, loading, isBookmarked: (id) => ids.has(id), toggle, refresh }),
    [ids, loading, toggle, refresh],
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks(): BookmarksValue {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used inside BookmarksProvider");
  return ctx;
}
