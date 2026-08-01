"use client";

/**
 * The red dots: is there anything new in the discussion, or in homework.
 *
 * Both answers are one comparison against a timestamp the learner carries,
 * so this costs two small reads on load and nothing after that. Opening the
 * page in question is what clears its dot -- there is no separate "mark as
 * read", because arriving somewhere is the only honest evidence that you
 * looked at it.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "./auth-context";
import { fetchSeen, markSeen, type SeenArea } from "./seen";

interface ActivityValue {
  newDiscussion: boolean;
  newHomework: boolean;
  /** Called by a page when the learner actually gets there. */
  see: (area: SeenArea) => Promise<void>;
  refresh: () => Promise<void>;
}

const ActivityContext = createContext<ActivityValue | null>(null);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { user, configured } = useAuth();
  const [newDiscussion, setNewDiscussion] = useState(false);
  const [newHomework, setNewHomework] = useState(false);

  const uid = user?.uid ?? null;

  const refresh = useCallback(async () => {
    if (!uid || !configured) {
      setNewDiscussion(false);
      setNewHomework(false);
      return;
    }
    try {
      const seen = await fetchSeen(uid);

      // Only the newest of each is needed. "Is anything newer than X" does
      // not require counting, and a limit(1) keeps this cheap however long
      // the room has been running.
      const latestMessage = await getDocs(
        query(collection(getDb(), "discussion"), orderBy("at", "desc"), limit(1)),
      );
      const newestAt = latestMessage.empty
        ? 0
        : Number((latestMessage.docs[0].data() as { at?: number }).at ?? 0);
      setNewDiscussion(newestAt > seen.discussion);

      const assignments = await getDocs(
        query(collection(getDb(), "assignments"), where("status", "==", "published")),
      );
      const newestHw = assignments.docs.reduce((max, d) => {
        const a = d.data() as { createdAt?: number };
        return Math.max(max, Number(a.createdAt ?? 0));
      }, 0);
      setNewHomework(newestHw > seen.homework);
    } catch {
      // Rules not deployed, or offline. No dot is the right answer: a dot
      // pointing at a page that cannot load is worse than no dot.
      setNewDiscussion(false);
      setNewHomework(false);
    }
  }, [uid, configured]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const see = useCallback(
    async (area: SeenArea) => {
      if (!uid) return;
      if (area === "discussion") setNewDiscussion(false);
      else setNewHomework(false);
      try {
        await markSeen(uid, area, Date.now());
      } catch {
        // The dot is already gone locally; it comes back on the next load if
        // the write really failed, which is the harmless direction to err in.
      }
    },
    [uid],
  );

  const value = useMemo<ActivityValue>(
    () => ({ newDiscussion, newHomework, see, refresh }),
    [newDiscussion, newHomework, see, refresh],
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity(): ActivityValue {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used inside ActivityProvider");
  return ctx;
}
