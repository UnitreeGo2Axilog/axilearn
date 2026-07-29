"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";

export default function ProfilePage() {
  const t = useT();
  const locale = useLocale();
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="mx-auto max-w-md px-4 py-12 text-slate-500">…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <Link
          href={`/${locale}/login`}
          className="btn-neon rounded-lg px-4 py-2 text-sm font-bold"
        >
          {t("auth.signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-50">{t("profile.title")}</h1>
      <dl className="panel panel-glow space-y-3 rounded-2xl p-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-400">{t("auth.name")}</dt>
          <dd className="font-medium">{profile?.displayName ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">{t("auth.email")}</dt>
          <dd className="font-medium">{user.email ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">{t("profile.role")}</dt>
          <dd className="font-medium capitalize">{profile?.role ?? "student"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">{t("profile.language")}</dt>
          <dd className="font-medium uppercase">{locale}</dd>
        </div>
      </dl>
    </div>
  );
}
