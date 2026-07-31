"use client";

/**
 * A plain tab strip. Two very different screens use it -- a challenge's
 * Problem / Editorial / Tutorial, and the track briefing's sections -- and
 * that is deliberate: both had the same underlying problem, which is a page
 * carrying more content than fits comfortably in one scroll. One component
 * means both behave and look identical rather than drifting apart.
 *
 * Tabs are real <button>s in a `tablist`, wired with the aria attributes and
 * arrow-key movement the pattern expects, so this stays usable from a
 * keyboard instead of being a mouse-only decoration.
 */
import { useRef } from "react";

export interface TabItem<Id extends string> {
  id: Id;
  label: string;
  /** A tab can be present but not yet openable -- a locked editorial. */
  icon?: React.ReactNode;
}

export function Tabs<Id extends string>({
  tabs,
  active,
  onChange,
  accent,
}: {
  tabs: TabItem<Id>[];
  active: Id;
  onChange: (id: Id) => void;
  accent: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === active);
    const next = e.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    // Move focus with the selection, or the next arrow press starts from the
    // old tab and the keyboard order stops matching what is on screen.
    const buttons = stripRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    buttons?.[next]?.focus();
  }

  return (
    <div
      ref={stripRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className="flex flex-wrap items-center gap-1 border-b"
      style={{ borderColor: "var(--border)" }}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className="-mb-px inline-flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm font-bold transition"
            style={{
              borderColor: selected ? accent : "transparent",
              color: selected ? accent : "var(--text-muted)",
            }}
          >
            {tab.label}
            {tab.icon}
          </button>
        );
      })}
    </div>
  );
}
