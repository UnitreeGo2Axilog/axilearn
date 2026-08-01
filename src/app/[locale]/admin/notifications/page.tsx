"use client";

/**
 * Writing the tips: what they say, and when they show up.
 *
 * The schedule is the whole feature. "daily" and "weekly" put a message in a
 * rotating pool -- one from each pool shows per day and per week, so twenty
 * tips are twenty days of nudges rather than twenty notifications on the
 * first morning. "On a date" is for the things that are actually news.
 */
import { useCallback, useEffect, useState } from "react";
import { Bell, Plus, Save, Trash2 } from "lucide-react";
import {
  deleteNotification,
  listNotifications,
  saveNotification,
} from "@/lib/notifications";
import type {
  NotificationCategory,
  NotificationDoc,
  NotificationSchedule,
} from "@/content/schema";
import {
  AdminGuard,
  Field,
  L10nInput,
  StatusToggle,
} from "@/components/admin/admin-shell";
import { CollapsibleCard } from "@/components/admin/collapsible-card";
import { isoDay } from "@/lib/notification-schedule";
import { useT } from "@/i18n/use-t";

const CATEGORIES: NotificationCategory[] = [
  "programming",
  "robotics",
  "games",
  "practice",
  "announcement",
];

export default function AdminNotificationsPage() {
  return (
    <AdminGuard>
      <Editor />
    </AdminGuard>
  );
}

function Editor() {
  const t = useT();
  const [items, setItems] = useState<NotificationDoc[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Set once after mount -- reading the clock during render is impure. */
  const [todayIso, setTodayIso] = useState("");

  useEffect(() => {
    setTodayIso(isoDay(new Date()));
  }, []);

  const load = useCallback(async () => {
    try {
      // Newest first: the one you just wrote is the one you are working on.
      setItems((await listNotifications()).slice().reverse());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function persist(n: NotificationDoc) {
    setBusy(n.id);
    setError(null);
    try {
      await saveNotification(n);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    setBusy(id);
    try {
      await deleteNotification(id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function addNew() {
    const n: NotificationDoc = {
      id: `tip-${Date.now()}`,
      order: (items?.length ?? 0),
      status: "draft",
      category: "practice",
      schedule: { kind: "daily" },
      title: { en: "" },
      body: { en: "" },
    };
    setItems([n, ...(items ?? [])]);
  }

  function patch(id: string, changes: Partial<NotificationDoc>) {
    setItems((prev) => (prev ?? []).map((n) => (n.id === id ? { ...n, ...changes } : n)));
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-3xl font-extrabold text-strong">
            <Bell className="h-7 w-7" style={{ color: "var(--reward)" }} />
            {t("notif.adminTitle")}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
            {t("notif.adminIntro")}
          </p>
        </div>
        <button
          onClick={addNew}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black"
          style={{ background: "var(--neon)", color: "var(--surface-solid)" }}
        >
          <Plus className="h-3.5 w-3.5" />
          {t("notif.adminNew")}
        </button>
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

      {items === null ? (
        <p className="text-sm text-faint">…</p>
      ) : items.length === 0 ? (
        <p className="panel rounded-2xl p-5 text-sm text-muted">{t("notif.adminEmpty")}</p>
      ) : (
        <div className="space-y-3">
          {items.map((n, i) => (
            <CollapsibleCard
              key={n.id}
              defaultOpen={i === 0}
              title={n.title.en}
              subtitle={`${n.category} · ${n.schedule.kind}`}
              badge={
                <span
                  className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                  style={{
                    background:
                      n.status === "published"
                        ? "color-mix(in srgb, var(--cleared) 16%, transparent)"
                        : "var(--bg-2)",
                    color: n.status === "published" ? "var(--cleared)" : "var(--text-faint)",
                  }}
                >
                  {n.status}
                </span>
              }
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-robot text-[11px] font-bold text-faint">{n.id}</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => void persist(n)}
                    disabled={busy === n.id || !n.title.en.trim()}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-black disabled:opacity-40"
                    style={{ background: "var(--cleared)", color: "var(--surface-solid)" }}
                  >
                    <Save className="h-3 w-3" />
                    {t("admin.save")}
                  </button>
                  <button
                    onClick={() => void remove(n.id)}
                    disabled={busy === n.id}
                    aria-label={t("admin.remove")}
                    className="rounded-lg border p-1.5 text-faint"
                    style={{ borderColor: "var(--border-strong)" }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <L10nInput
                  label={t("notif.fTitle")}
                  value={n.title}
                  onChange={(title) => patch(n.id, { title })}
                />
                <L10nInput
                  label={t("notif.fBody")}
                  value={n.body}
                  onChange={(body) => patch(n.id, { body })}
                  rows={3}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-2.5">
                <Field label={t("notif.fCategory")}>
                  <select
                    value={n.category}
                    onChange={(e) =>
                      patch(n.id, { category: e.target.value as NotificationCategory })
                    }
                    className="field w-full rounded-xl px-3 py-2.5 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t("notif.fWhen")}>
                  <select
                    value={n.schedule.kind}
                    onChange={(e) => {
                      const kind = e.target.value as NotificationSchedule["kind"];
                      patch(n.id, {
                        schedule:
                          kind === "date"
                            ? { kind: "date", date: todayIso }
                            : ({ kind } as NotificationSchedule),
                      });
                    }}
                    className="field w-full rounded-xl px-3 py-2.5 text-sm"
                  >
                    <option value="daily">{t("notif.whenDaily")}</option>
                    <option value="weekly">{t("notif.whenWeekly")}</option>
                    <option value="date">{t("notif.whenDate")}</option>
                  </select>
                </Field>

                {n.schedule.kind === "date" && (
                  <Field label={t("notif.fDate")}>
                    <input
                      type="date"
                      value={n.schedule.date}
                      onChange={(e) =>
                        patch(n.id, { schedule: { kind: "date", date: e.target.value } })
                      }
                      className="field w-full rounded-xl px-3 py-2.5 text-sm"
                    />
                  </Field>
                )}

                <StatusToggle
                  status={n.status}
                  onChange={(status) => patch(n.id, { status })}
                />
              </div>
            </CollapsibleCard>
          ))}
        </div>
      )}
    </div>
  );
}
