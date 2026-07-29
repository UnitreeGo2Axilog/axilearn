"use client";

import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/i18n/use-t";

/**
 * Placeholder for the Phase-2 CMS. Guarded on the client for UX, but the real
 * protection is in firestore.rules -- only an admin can write content, so a
 * curious student reaching this URL still cannot change anything.
 */
export default function AdminPage() {
  const t = useT();
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-12 text-slate-500">…</div>;
  }

  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <p className="text-sm">{t("admin.denied")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-3 text-2xl font-bold">{t("admin.title")}</h1>
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        {t("admin.soon")}
      </p>
    </div>
  );
}
