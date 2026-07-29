"use client";

/**
 * Shared furniture for the CMS: the role guard and the form fields.
 *
 * The guard is UX, not security -- a student who types /admin sees a polite
 * wall, but what actually stops them writing content is firestore.rules. Worth
 * being explicit about, because a client-side role check looks like protection
 * and is not.
 */
import Link from "next/link";
import { ArrowLeft, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";
import type { L10n } from "@/content/schema";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const t = useT();
  const { profile, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--advanced)", borderRightColor: "var(--advanced)" }}
        />
      </div>
    );
  }

  if (!user || profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div
          className="flex items-center gap-3 rounded-xl border p-4"
          style={{
            borderColor: "color-mix(in srgb, var(--reward) 40%, transparent)",
            background: "color-mix(in srgb, var(--reward) 10%, transparent)",
            color: "var(--reward)",
          }}
        >
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <p className="text-sm">{t("admin.denied")}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Back link that keeps the locale prefix. */
export function AdminBack({ href, label }: { href: string; label: string }) {
  const locale = useLocale();
  return (
    <Link
      href={`/${locale}${href}`}
      className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:opacity-80"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}

/* ---------------------------------------------------------------- fields */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-faint">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-faint">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="field w-full rounded-xl px-3 py-2.5 text-sm" />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="field w-full rounded-xl px-3 py-2.5 text-sm" />;
}

/**
 * One bilingual string.
 *
 * English is required and French is not: the supervisor can publish a lesson
 * the day he writes it and translate later, and until he does, French readers
 * see the English text rather than a blank page.
 */
export function L10nInput({
  label,
  value,
  onChange,
  rows,
  required = true,
}: {
  label: string;
  value: L10n;
  onChange: (next: L10n) => void;
  rows?: number;
  required?: boolean;
}) {
  const t = useT();
  const Input = rows ? TextArea : TextInput;
  return (
    <div className="space-y-2">
      <Field label={`${label} · EN${required ? " *" : ""}`}>
        <Input
          rows={rows}
          value={value.en}
          onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
            onChange({ ...value, en: e.target.value })
          }
        />
      </Field>
      <Field label={`${label} · FR`} hint={t("admin.frOptional")}>
        <Input
          rows={rows}
          value={value.fr ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
            onChange({ ...value, fr: e.target.value })
          }
        />
      </Field>
    </div>
  );
}

/** A list of bilingual strings, for things like outcomes and advice. */
export function L10nListInput({
  label,
  items,
  onChange,
  rows,
}: {
  label: string;
  items: L10n[];
  onChange: (next: L10n[]) => void;
  rows?: number;
}) {
  const t = useT();
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-strong">{label}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border p-3"
            style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-robot text-[11px] font-bold text-faint">#{i + 1}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="inline-flex items-center gap-1 text-[11px] font-bold"
                style={{ color: "var(--reward)" }}
              >
                <Trash2 className="h-3 w-3" />
                {t("admin.remove")}
              </button>
            </div>
            <L10nInput
              label={label}
              value={item}
              rows={rows}
              onChange={(next) => onChange(items.map((x, j) => (j === i ? next : x)))}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, { en: "" }])}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-main"
        style={{ borderColor: "var(--border-strong)" }}
      >
        <Plus className="h-3.5 w-3.5" />
        {t("admin.add")}
      </button>
    </div>
  );
}

/** Draft / Published, the one control that decides what learners can see. */
export function StatusToggle({
  status,
  onChange,
}: {
  status: "draft" | "published";
  onChange: (next: "draft" | "published") => void;
}) {
  const t = useT();
  const published = status === "published";
  return (
    <button
      type="button"
      onClick={() => onChange(published ? "draft" : "published")}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wide transition"
      style={{
        borderColor: published
          ? "color-mix(in srgb, var(--cleared) 50%, transparent)"
          : "var(--border-strong)",
        background: published
          ? "color-mix(in srgb, var(--cleared) 14%, transparent)"
          : "var(--bg-2)",
        color: published ? "var(--cleared)" : "var(--text-faint)",
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: published ? "var(--cleared)" : "var(--text-faint)" }}
      />
      {published ? t("admin.published") : t("admin.draft")}
    </button>
  );
}

export function StatusChip({ status }: { status: "draft" | "published" }) {
  const t = useT();
  const published = status === "published";
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
      style={{
        background: published
          ? "color-mix(in srgb, var(--cleared) 14%, transparent)"
          : "color-mix(in srgb, var(--reward) 14%, transparent)",
        color: published ? "var(--cleared)" : "var(--reward)",
      }}
    >
      {published ? t("admin.published") : t("admin.draft")}
    </span>
  );
}

/** Saving / saved / failed, shown next to a form's save button. */
export function SaveState({ state, error }: { state: "idle" | "saving" | "saved"; error?: string | null }) {
  const t = useT();
  if (error)
    return (
      <span className="text-xs font-bold" style={{ color: "var(--reward)" }}>
        {error}
      </span>
    );
  if (state === "saving") return <span className="text-xs text-faint">{t("admin.saving")}</span>;
  if (state === "saved")
    return (
      <span className="text-xs font-bold" style={{ color: "var(--cleared)" }}>
        {t("admin.saved")}
      </span>
    );
  return null;
}
