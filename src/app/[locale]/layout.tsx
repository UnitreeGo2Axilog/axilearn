import { notFound } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { LocaleProvider } from "@/i18n/use-t";
import { isLocale, LOCALES } from "@/i18n/messages";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/content/types";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <LocaleProvider locale={locale as Locale}>
      <AuthProvider locale={locale as Locale}>
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </AuthProvider>
    </LocaleProvider>
  );
}
