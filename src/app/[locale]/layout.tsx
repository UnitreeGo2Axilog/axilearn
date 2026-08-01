import { notFound } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { ProgressProvider } from "@/lib/progress-context";
import { BookmarksProvider } from "@/lib/bookmarks-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { ActivityProvider } from "@/lib/activity-context";
import { ThemeProvider } from "@/lib/theme";
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
    <ThemeProvider>
      <LocaleProvider locale={locale as Locale}>
        <AuthProvider locale={locale as Locale}>
          <ProgressProvider>
            <BookmarksProvider>
              <NotificationsProvider>
                <ActivityProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
                </ActivityProvider>
              </NotificationsProvider>
            </BookmarksProvider>
          </ProgressProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
