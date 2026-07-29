"use client";

/**
 * Client-side access to the current locale and translations.
 * The locale comes from the URL (/en/... or /fr/...) via this provider, set
 * once in the locale layout.
 */
import { createContext, useContext } from "react";
import type { Locale } from "@/content/types";
import { messages, type MessageKey } from "./messages";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useT() {
  const locale = useLocale();
  return (key: MessageKey): string =>
    messages[locale][key] ?? messages.en[key] ?? key;
}
