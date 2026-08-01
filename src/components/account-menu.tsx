"use client";

/**
 * Everything a signed-in person can reach, behind their own avatar.
 *
 * The header used to carry the whole account area as loose links -- profile,
 * admin, sign out -- which works at three items and stops working at nine.
 * Collecting them under the avatar is what lets the platform grow a Homework
 * page or a Bookmarks page without the header growing with it.
 *
 * A STUDENT and an ADMIN get different menus, not one menu with things greyed
 * out. They do different jobs: nobody managing a platform wants "My Progress"
 * on their way to the student roster, and no learner needs "Notifications" to
 * exist before it means anything to them.
 *
 * Entries whose page is not built yet are shown, disabled, with a "soon"
 * chip. That is deliberate -- a menu that quietly grows over weeks makes the
 * platform feel unfinished in a way a visible, honest roadmap does not, and a
 * link that 404s is worse than one that says it is not ready.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookMarked,
  Bell,
  ChevronDown,
  ClipboardList,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useBookmarks } from "@/lib/bookmarks-context";
import { Avatar } from "@/components/avatar";
import { useLocale, useT } from "@/i18n/use-t";
import type { MessageKey } from "@/i18n/messages";

interface Entry {
  key: MessageKey;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Shown with a "soon" chip and no link. */
  soon?: boolean;
  /** A count badge, e.g. saved lessons. */
  badge?: number;
  /** Draws the divider above this entry. */
  separated?: boolean;
}

export function AccountMenu() {
  const t = useT();
  const locale = useLocale();
  const { user, profile, logout } = useAuth();
  const { ids: bookmarkIds } = useBookmarks();
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
  const isAdmin = profile?.role === "admin";

  const studentEntries: Entry[] = [
    { key: "nav.home", href: `/${locale}`, icon: Home },
    { key: "nav.progress", href: `/${locale}/progress`, icon: TrendingUp },
    { key: "nav.homework", icon: ClipboardList, soon: true },
    { key: "nav.certificates", href: `/${locale}/certificates`, icon: Award },
    { key: "nav.bookmarks", href: `/${locale}/bookmarks`, icon: BookMarked, badge: bookmarkIds.size },
    { key: "nav.info", href: `/${locale}/info`, icon: Info, separated: true },
    { key: "nav.contact", href: `/${locale}/contact`, icon: Mail },
  ];

  const adminEntries: Entry[] = [
    { key: "nav.dashboard", href: `/${locale}/admin`, icon: LayoutDashboard },
    { key: "nav.students", href: `/${locale}/admin/students`, icon: Users },
    { key: "nav.homeworkReview", icon: ClipboardList, soon: true },
    { key: "nav.notifications", icon: Bell, soon: true },
    { key: "nav.info", href: `/${locale}/info`, icon: Info, separated: true },
  ];

  const entries = isAdmin ? adminEntries : studentEntries;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={profile?.displayName ?? t("nav.profile")}
        className="flex items-center gap-1 rounded-full transition hover:opacity-80"
      >
        <Avatar uid={user.uid} displayName={profile?.displayName} email={user.email} size={32} />
        <ChevronDown
          className="h-3.5 w-3.5 text-faint transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border shadow-2xl"
          style={{ borderColor: "var(--border-strong)", background: "var(--surface-solid)" }}
        >
          {/* who you are, and the way to change it */}
          <div className="flex items-center gap-3 p-3.5">
            <Avatar
              uid={user.uid}
              displayName={profile?.displayName}
              email={user.email}
              size={40}
              ring
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-strong">
                {profile?.displayName ?? t("nav.profile")}
              </p>
              <Link
                href={`/${locale}/profile`}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-bold transition hover:opacity-80"
                style={{ color: "var(--neon)" }}
              >
                <UserRound className="h-3 w-3" />
                {t("nav.editProfile")}
              </Link>
            </div>
            {isAdmin && (
              <span
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                style={{
                  background: "color-mix(in srgb, var(--advanced) 18%, transparent)",
                  color: "var(--advanced)",
                }}
              >
                {t("nav.admin")}
              </span>
            )}
          </div>

          <div className="h-px" style={{ background: "var(--border)" }} />

          <div className="p-1.5">
            {entries.map((e) => (
              <MenuRow key={e.key} entry={e} t={t} onNavigate={() => setOpen(false)} />
            ))}
          </div>

          <div className="h-px" style={{ background: "var(--border)" }} />

          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-bold transition hover:opacity-80"
              style={{ color: "var(--reward)" }}
            >
              <LogOut className="h-4 w-4" />
              {t("nav.signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuRow({
  entry,
  t,
  onNavigate,
}: {
  entry: Entry;
  t: (k: MessageKey) => string;
  onNavigate: () => void;
}) {
  const Icon = entry.icon;
  const shared =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold";

  const body = (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{t(entry.key)}</span>
      {entry.soon && (
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
          style={{ background: "var(--bg-2)", color: "var(--text-faint)" }}
        >
          {t("nav.soon")}
        </span>
      )}
      {!entry.soon && entry.badge ? (
        <span
          className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black"
          style={{ background: "color-mix(in srgb, var(--neon) 18%, transparent)", color: "var(--neon)" }}
        >
          {entry.badge}
        </span>
      ) : null}
    </>
  );

  return (
    <>
      {entry.separated && <div className="my-1.5 h-px" style={{ background: "var(--border)" }} />}
      {entry.soon || !entry.href ? (
        <span className={`${shared} cursor-default text-faint`}>{body}</span>
      ) : (
        <Link
          href={entry.href}
          role="menuitem"
          onClick={onNavigate}
          className={`${shared} text-main transition hover:opacity-80`}
        >
          {body}
        </Link>
      )}
    </>
  );
}
