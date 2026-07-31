"use client";

/**
 * The signed-in learner's own progress, fetched once and shared.
 *
 * The map, the profile and the home strip all need "what have I finished".
 * Fetching it in each of them would triple the read count on every navigation
 * for no benefit, so it is fetched here and handed down.
 *
 * Lesson completions and solved challenges are fetched together but stay
 * separate: XP and level come from LESSONS ONLY. Challenges are optional
 * practice and award none -- one score for progress through the course is
 * clearer than two competing currencies. Solved challenges are still tracked
 * (the profile and the admin roster both report them), just not as XP.
 *
 * `refresh` exists so marking a lesson done (or solving a challenge) updates
 * the map/page behind it without a page reload.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth-context";
import {
  countsTowardScore,
  fetchMyChallengeProgress,
  fetchMyProgress,
  isSolved,
  levelFromXp,
  streakFromRecords,
  touchLastSeen,
  type ChallengeProgressRecord,
  type ProgressRecord,
} from "./progress";

interface ProgressValue {
  records: ProgressRecord[];
  completedIds: Set<string>;
  challengeRecords: ChallengeProgressRecord[];
  /** Solved at all -- what puts a tick on a challenge. */
  solvedChallengeIds: Set<string>;
  /** Solved without revealing the editorial -- what the counter reports. */
  countedChallengeIds: Set<string>;
  /** Editorial revealed, so this one is excluded from the counter. */
  editorialUnlockedIds: Set<string>;
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
  const [challengeRecords, setChallengeRecords] = useState<ChallengeProgressRecord[]>([]);
  const [loading, setLoading] = useState(false);
  /** Today, as state, so the streak is not computed from a clock read during
      render -- impure, and the React Compiler may call render twice. */
  const [now, setNow] = useState(0);

  const uid = user?.uid ?? null;

  const refresh = useCallback(async () => {
    if (!uid || !configured) {
      setRecords([]);
      setChallengeRecords([]);
      return;
    }
    setLoading(true);
    try {
      const [lessons, challenges] = await Promise.all([
        fetchMyProgress(uid),
        fetchMyChallengeProgress(uid),
      ]);
      setRecords(lessons);
      setChallengeRecords(challenges);
    } catch {
      // Offline or rules not deployed yet: an empty record set is the honest
      // answer, and the maps simply show nothing completed.
      setRecords([]);
      setChallengeRecords([]);
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
      challengeRecords,
      solvedChallengeIds: new Set(
        challengeRecords.filter(isSolved).map((r) => r.challengeId),
      ),
      countedChallengeIds: new Set(
        challengeRecords.filter(countsTowardScore).map((r) => r.challengeId),
      ),
      editorialUnlockedIds: new Set(
        challengeRecords.filter((r) => r.usedEditorial === true).map((r) => r.challengeId),
      ),
      xp,
      level,
      into,
      span,
      streak: streakFromRecords(records, now),
      loading,
      refresh,
    };
  }, [records, challengeRecords, now, loading, refresh]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
