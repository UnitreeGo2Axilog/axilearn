"use client";

/**
 * What is in the bell, and how much of it is new.
 *
 * `today` is held as state set once after mount rather than read during
 * render: reading the clock while rendering is impure, and the React Compiler
 * is entitled to render twice. It also means the whole schedule is a pure
 * function of (messages, today), which is what made it testable.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth-context";
import {
  fetchNotifications,
  fetchReadNotificationIds,
  markNotificationsRead,
} from "./notifications";
import { unreadNotifications, visibleNotifications } from "./notification-schedule";
import { fetchAllThreads, fetchMyThreads } from "./contact";
import type { ContactThread, NotificationDoc } from "@/content/schema";

interface NotificationsValue {
  visible: NotificationDoc[];
  unread: NotificationDoc[];
  /**
   * Conversations waiting on whoever is signed in: a reply for a learner, a
   * question for the staff.
   *
   * Kept apart from the tips, and NOT cleared by opening the bell. A tip is
   * read by being seen; an unanswered question is not answered by being
   * glanced at. These clear when the thread itself is opened.
   */
  messageAlerts: ContactThread[];
  loading: boolean;
  /** Called when the panel is opened -- everything shown becomes read. */
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, configured } = useAuth();
  const [all, setAll] = useState<NotificationDoc[]>([]);
  const [messageAlerts, setMessageAlerts] = useState<ContactThread[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(false);
  const [today, setToday] = useState<Date | null>(null);

  const uid = user?.uid ?? null;
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    setToday(new Date());
  }, []);

  const refresh = useCallback(async () => {
    if (!uid || !configured) {
      setAll([]);
      setReadIds(new Set());
      setMessageAlerts([]);
      return;
    }
    setLoading(true);
    try {
      const [messages, read] = await Promise.all([
        fetchNotifications(),
        fetchReadNotificationIds(uid),
      ]);
      setAll(messages);
      setReadIds(new Set(read));
    } catch {
      // Rules not deployed yet, or offline. An empty bell is the honest
      // answer and nothing else on the platform depends on it.
      setAll([]);
      setReadIds(new Set());
    } finally {
      setLoading(false);
    }

    // Threads are fetched separately and allowed to fail on their own. If
    // the contact rules are not deployed yet, the tips should still work --
    // one half of the bell being unavailable is not a reason to empty it.
    try {
      const threads = isAdmin ? await fetchAllThreads() : await fetchMyThreads(uid);
      setMessageAlerts(
        threads.filter((th) => (isAdmin ? th.adminUnread : th.studentUnread)),
      );
    } catch {
      setMessageAlerts([]);
    }
  }, [uid, configured, isAdmin]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visible = useMemo(
    () => (today ? visibleNotifications(all, today) : []),
    [all, today],
  );
  const unread = useMemo(() => unreadNotifications(visible, readIds), [visible, readIds]);

  const markAllRead = useCallback(async () => {
    if (!uid || unread.length === 0) return;
    const ids = unread.map((n) => n.id);
    setReadIds((prev) => new Set([...prev, ...ids])); // optimistic: the badge
    try {                                             // must clear on open
      await markNotificationsRead(uid, ids);
    } catch {
      void refresh(); // put the badge back rather than lie
    }
  }, [uid, unread, refresh]);

  const value = useMemo<NotificationsValue>(
    () => ({ visible, unread, messageAlerts, loading, markAllRead, refresh }),
    [visible, unread, messageAlerts, loading, markAllRead, refresh],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}
