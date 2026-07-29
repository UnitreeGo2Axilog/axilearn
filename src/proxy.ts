/**
 * Sends "/" to a language. Uses the browser's Accept-Language header so a
 * French visitor lands on French, everyone else on English. Every real page
 * therefore lives under /en/... or /fr/..., which keeps the two languages
 * fully separate and shareable by URL.
 */
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/messages";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const accept = request.headers.get("accept-language") ?? "";
  const locale = accept.toLowerCase().startsWith("fr") ? "fr" : DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, the API and anything with a file extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
