"use client";

/**
 * The red dots: is there anything new in the discussion, or in homework.
 *
 * LIVE, not read once on load. The first version fetched both collections in
 * an effect that ran only when the provider mounted, so a learner already on
 * the site never saw a dot appear -- the teacher would share an assignment
 * and nothing happened until the student reloaded, which is the one moment
 * they no longer need telling. These are snapshot listeners now, so the dot
 * arrives when the thing it is about does.
 *
 * WHAT "NEW HOMEWORK" MEANS DEPENDS ON WHO IS ASKING, and conflating the two
 * left the teacher with a dot that could only ever mean "you published
 * something", which they already knew:
 *
 *   - to a LEARNER it is an assignment shared since they last looked;
 *   - to a TEACHER it is a submission handed in since they last looked.
 *
 * Both compare against one timestamp on the person's own user document, so
 * the whole feature costs two listeners and no new collection.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "./auth-context";
import { fetchSeen, markSeen, type SeenArea } from "./seen";

interface ActivityValue {
  newDiscussion: boolean;
  newHomework: boolean;
  /** Called by a page when the person actually gets there. */
  see: (area: SeenArea) => Promise<void>;
  refresh: () => Promise<void>;
}

const ActivityContext = createContext<ActivityValue | null>(null);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, configured } = useAuth();
  const [seen, setSeen] = useState<Record<SeenArea, number> | null>(null);
  const [latestDiscussion, setLatestDiscussion] = useState(0);
  const [latestHomework, setLatestHomework] = useState(0);

  const uid = user?.uid ?? null;
  const isAdmin = profile?.role === "admin";
  const ready = Boolean(uid && configured);

  const loadSeen = useCallback(async () => {
    if (!uid || !configured) {
      setSeen(null);
      return;
    }
    try {
      setSeen(await fetchSeen(uid));
    } catch {
      setSeen(null);
    }
  }, [uid, configured]);

  useEffect(() => {
    void loadSeen();
  }, [loadSeen]);

  // Newest message in the room. limit(1) keeps the cost the same however long
  // the room has been running.
  useEffect(() => {
    if (!ready) return;
    return onSnapshot(
      query(collection(getDb(), "discussion"), orderBy("at", "desc"), limit(1)),
      (snap) => {
        setLatestDiscussion(
          snap.empty ? 0 : Number((snap.docs[0].data() as { at?: number }).at ?? 0),
        );
      },
      // Rules not deployed yet: no dot. A dot pointing at a page that cannot
      // load is worse than no dot.
      () => setLatestDiscussion(0),
    );
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    if (isAdmin) {
      // The teacher's signal is work handed IN, not work they set themselves.
      return onSnapshot(
        query(collection(getDb(), "submissions"), orderBy("submittedAt", "desc"), limit(1)),
        (snap) => {
          setLatestHomework(
            snap.empty
              ? 0
              : Number((snap.docs[0].data() as { submittedAt?: number }).submittedAt ?? 0),
          );
        },
        () => setLatestHomework(0),
      );
    }

    // The learner's is an assignment SHARED since they last looked, which is
    // publishedAt -- not createdAt. A draft written last week and published
    // this morning is new this morning, and watching createdAt is why sharing
    // one lit nothing up. createdAt is the fallback, for assignments that
    // were published before the field existed.
    return onSnapshot(
      query(collection(getDb(), "assignments"), where("status", "==", "published")),
      (snap) => {
        setLatestHomework(
          snap.docs.reduce((max, d) => {
            const a = d.data() as { publishedAt?: number; createdAt?: number };
            return Math.max(max, Number(a.publishedAt ?? a.createdAt ?? 0));
          }, 0),
        );
      },
      () => setLatestHomework(0),
    );
  }, [ready, isAdmin]);

  const see = useCallback(
    async (area: SeenArea) => {
      if (!uid) return;
      const at = Date.now();
      setSeen((prev) => ({ discussion: 0, homework: 0, ...(prev ?? {}), [area]: at }));
      try {
        await markSeen(uid, area, at);
      } catch {
        // The dot is already gone locally and comes back on the next load if
        // the write really failed -- the harmless direction to be wrong in.
      }
    },
    [uid],
  );

  const value = useMemo<ActivityValue>(
    () => ({
      // Nothing until `seen` has loaded. Treating "not known yet" as zero
      // would flash both dots on every single page load.
      newDiscussion: seen !== null && latestDiscussion > seen.discussion,
      newHomework: seen !== null && latestHomework > seen.homework,
      see,
      refresh: loadSeen,
    }),
    [seen, latestDiscussion, latestHomework, see, loadSeen],
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity(): ActivityValue {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used inside ActivityProvider");
  return ctx;
}
