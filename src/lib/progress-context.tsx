"use client";

/**
 * The signed-in learner's own progress, fetched once and shared.
 *
 * The map, the profile and the home strip all need "what have I finished".
 * Fetching it in each of them would triple the read count on every navigation
 * for no benefit, so it is fetched here and handed down.
 *
 * `refresh` exists so marking a lesson done updates the map behind it without a
 * page reload.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth-context";
import {
  fetchMyProgress,
  levelFromXp,
  streakFromRecords,
  touchLastSeen,
  type ProgressRecord,
} from "./progress";

interface ProgressValue {
  records: ProgressRecord[];
  completedIds: Set<string>;
  xp: number;
  level: number;
  into: number;
  span: number;
  /** Consecutive days with a completion. Real, not a decoration. */
  streak: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user, configured } = useAuth();
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(false);
  /** Today, as state, so the streak is not computed from a clock read during
      render -- impure, and the React Compiler may call render twice. */
  const [now, setNow] = useState(0);

  const uid = user?.uid ?? null;

  const refresh = useCallback(async () => {
    if (!uid || !configured) {
      setRecords([]);
      return;
    }
    setLoading(true);
    try {
      setRecords(await fetchMyProgress(uid));
    } catch {
      // Offline or rules not deployed yet: an empty record set is the honest
      // answer, and the maps simply show nothing completed.
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [uid, configured]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setNow(Date.now());
    // A streak only turns over at midnight; five minutes is ample.
    const timer = setInterval(() => setNow(Date.now()), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Presence: mark the learner as around now, then keep it fresh while the tab
  // lives. touchLastSeen throttles the actual write.
  useEffect(() => {
    if (!uid || !configured) return;
    void touchLastSeen(uid).catch(() => {});
    const timer = setInterval(() => void touchLastSeen(uid).catch(() => {}), 4 * 60 * 1000);
    return () => clearInterval(timer);
  }, [uid, configured]);

  const value = useMemo<ProgressValue>(() => {
    const xp = records.reduce((sum, r) => sum + (r.xp ?? 0), 0);
    const { level, into, span } = levelFromXp(xp);
    return {
      records,
      completedIds: new Set(records.map((r) => r.lessonId)),
      xp,
      level,
      into,
      span,
      streak: streakFromRecords(records, now),
      loading,
      refresh,
    };
  }, [records, now, loading, refresh]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
