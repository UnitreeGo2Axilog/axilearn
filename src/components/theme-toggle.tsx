"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Tooltip } from "@/components/tooltip";

/** Switch between Neon Night and Daylight Lab. */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <Tooltip label={dark ? "Switch to light mode" : "Switch to dark mode"}>
      <button
        onClick={toggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className={`grid place-items-center rounded-lg border transition ${
          compact ? "h-9 w-9" : "h-9 w-9"
        }`}
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-2)",
          color: dark ? "var(--reward)" : "var(--neon)",
        }}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </Tooltip>
  );
}
