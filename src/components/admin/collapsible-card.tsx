"use client";

/**
 * One item in a long admin list, closed until you want it.
 *
 * These editors show every field of every record at once, which is fine at
 * three records and unusable at thirty: the thing you came to change is four
 * screens down, past twenty-nine you did not. Closed by default, with the
 * title and the status on the header row so the list stays scannable.
 *
 * The FIRST one opens. There is almost always exactly one record you are
 * working on -- the one just added -- and newest-first ordering puts it here.
 */
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function CollapsibleCard({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="panel rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 p-4 text-left"
      >
        <ChevronDown
          className="h-4 w-4 shrink-0 text-faint transition-transform"
          style={{ transform: open ? "none" : "rotate(-90deg)" }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-extrabold text-strong">
            {title || <span className="text-faint">—</span>}
          </span>
          {subtitle && <span className="mt-0.5 block truncate text-[11px] text-faint">{subtitle}</span>}
        </span>
        {badge}
      </button>
      {open && <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: "var(--border)" }}>{children}</div>}
    </div>
  );
}
