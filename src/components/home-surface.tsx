"use client";

/**
 * What the home page shows, which is not the same thing for both roles.
 *
 * A student picks a world here. An admin does not: they have no XP, no
 * progress and no track to start, so a wall of mission-select cards was
 * offering them the one thing on the platform they cannot do. They get the
 * two places they actually work instead.
 *
 * The cards are still rendered on the SERVER and handed in as children --
 * only the choice between them is client-side, because the role lives in the
 * learner's profile and nothing on the server knows who is asking. That keeps
 * a student's home page server-rendered exactly as it was.
 *
 * Preview is not a nicety. Hiding the learner view from the person writing
 * the lessons means editing blind, so the same switch that removes the cards
 * also gives them back on request.
 */
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LayoutDashboard, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";

export function HomeSurface({ children }: { children: React.ReactNode }) {
  const t = useT();
  const locale = useLocale();
  const { profile } = useAuth();
  const [preview, setPreview] = useState(false);

  if (profile?.role !== "admin") return <>{children}</>;

  return (
    <section>
      <div className="panel rounded-2xl p-5">
        <h2 className="text-sm font-extrabold text-strong">{t("home.adminHello")}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">{t("home.adminSurfaceHint")}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AdminLink
            href={`/${locale}/admin`}
            tone="var(--advanced)"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label={t("admin.dashboard")}
            body={t("admin.intro")}
          />
          <AdminLink
            href={`/${locale}/admin/students`}
            tone="var(--neon)"
            icon={<Users className="h-5 w-5" />}
            label={t("admin.openStudents")}
            body={t("admin.studentsIntro")}
          />
        </div>

        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-main transition hover:opacity-80"
          style={{ borderColor: "var(--border-strong)" }}
        >
          {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {preview ? t("home.exitPreview") : t("home.previewAsStudent")}
        </button>
      </div>

      {preview && <div className="mt-5">{children}</div>}
    </section>
  );
}

function AdminLink({
  href,
  tone,
  icon,
  label,
  body,
}: {
  href: string;
  tone: string;
  icon: React.ReactNode;
  label: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-xl border p-3.5 transition hover:opacity-90"
      style={{
        borderColor: `color-mix(in srgb, ${tone} 40%, transparent)`,
        background: `color-mix(in srgb, ${tone} 7%, var(--surface))`,
      }}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold text-strong">{label}</span>
        <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-muted">{body}</span>
      </span>
    </Link>
  );
}
