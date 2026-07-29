"use client";

/**
 * Theme state: "Neon Night" (dark) or "Daylight Lab" (light).
 *
 * The choice is stamped on <html data-theme> so plain CSS can switch every
 * variable at once, and remembered in localStorage. First-time visitors follow
 * their operating system. A tiny inline script (see ThemeScript) applies the
 * saved choice before first paint, which is what prevents the white flash you
 * normally get when a dark site hydrates.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";
const KEY = "axilearn-theme";

interface Ctx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<Ctx | null>(null);

/** Runs before paint: no flash of the wrong theme. */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('${KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Adopt whatever the pre-paint script already decided.
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") setThemeState(current);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* private mode -- theme just won't persist */
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
