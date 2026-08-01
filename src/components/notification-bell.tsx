"use client";

/**
 * The bell, beside the avatar rather than inside the menu.
 *
 * A badge on a menu you have to open first tells you nothing -- the whole
 * value of an unread count is being visible without a click. So the bell sits
 * outside, and only the things you navigate to live in the menu.
 *
 * Opening it marks everything shown as read. Not each item separately: these
 * are two-line tips, and asking somebody to dismiss five of them one by one
 * to clear a badge is a chore invented by the interface.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Bot, Gamepad2, Lightbulb, Megaphone, Terminal } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { pick } from "@/content/schema";
import type { NotificationCategory } from "@/content/schema";
import { useLocale, useT } from "@/i18n/use-t";
import type { Locale } from "@/content/types";

const CATEGORY: Record<
  NotificationCategory,
  { icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  programming: { icon: Terminal, tone: "var(--neon)" },
  robotics: { icon: Bot, tone: "var(--neon)" },
  games: { icon: Gamepad2, tone: "#f472b6" },
  practice: { icon: Lightbulb, tone: "var(--reward)" },
  announcement: { icon: Megaphone, tone: "var(--advanced)" },
};

export function NotificationBell() {
  const t = useT();
  const locale = useLocale() as Locale;
  const { user } = useAuth();
  const { visible, unread, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const count = unread.length;
  const unreadIds = new Set(unread.map((n) => n.id));

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) void markAllRead();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          count > 0
            ? t("notif.unread").replace("{n}", String(count))
            : t("notif.title")
        }
        className="relative grid h-9 w-9 place-items-center rounded-lg border transition hover:opacity-80"
        style={{ borderColor: "var(--border)", background: "var(--bg-2)", color: "var(--text-muted)" }}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span
            className="absolute -right-1 -top-1 grid min-w-[16px] place-items-center rounded-full px-1 text-[10px] font-black leading-4"
            style={{ background: "var(--reward)", color: "var(--surface-solid)" }}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("notif.title")}
          className="absolute right-0 z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-2xl border shadow-2xl"
          style={{ borderColor: "var(--border-strong)", background: "var(--surface-solid)" }}
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
            <span className="text-sm font-extrabold text-strong">{t("notif.title")}</span>
            {count > 0 && (
              <span className="text-[11px] font-bold" style={{ color: "var(--reward)" }}>
                {t("notif.newCount").replace("{n}", String(count))}
              </span>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="px-4 pb-4 text-xs leading-relaxed text-muted">{t("notif.empty")}</p>
          ) : (
            <div className="space-y-1 p-1.5 pt-0">
              {visible.map((n) => {
                const { icon: Icon, tone } = CATEGORY[n.category] ?? CATEGORY.announcement;
                const wasUnread = unreadIds.has(n.id);
                const body = (
                  <div
                    className="flex gap-2.5 rounded-xl p-2.5"
                    style={{
                      // Only the ones that were new when the panel opened are
                      // tinted. Everything fading to the same grey the instant
                      // you open it would make "new" meaningless.
                      background: wasUnread
                        ? `color-mix(in srgb, ${tone} 8%, transparent)`
                        : "transparent",
                    }}
                  >
                    <span
                      className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                      style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-extrabold text-strong">
                        {pick(n.title, locale)}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                        {pick(n.body, locale)}
                      </span>
                    </span>
                  </div>
                );

                return n.href ? (
                  <Link key={n.id} href={n.href} onClick={() => setOpen(false)} role="menuitem">
                    {body}
                  </Link>
                ) : (
                  <div key={n.id} role="menuitem">
                    {body}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
