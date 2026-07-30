"use client";

/**
 * A small label that appears after a beat of hovering (or on keyboard focus),
 * for anything whose meaning isn't spelled out by visible text -- an icon-only
 * button, a status dot, a badge. Appears after a short delay rather than
 * instantly, so it doesn't flicker across the screen while a pointer just
 * passes through on its way somewhere else.
 *
 * Keyboard users get it too, on focus, with no delay -- a mouse hover is
 * optional and reversible; landing on a control via Tab is a request to know
 * what it does right now.
 */
import { useId, useRef, useState } from "react";

const SHOW_DELAY_MS = 450;

export function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: React.ReactElement;
  side?: "top" | "bottom";
}) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  function schedule() {
    timer.current = setTimeout(() => setShow(true), SHOW_DELAY_MS);
  }
  function cancel() {
    if (timer.current) clearTimeout(timer.current);
    setShow(false);
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={schedule}
      onMouseLeave={cancel}
      onFocus={() => setShow(true)}
      onBlur={cancel}
    >
      {children}
      <span
        role="tooltip"
        id={id}
        className="pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold transition-opacity duration-150"
        style={{
          [side === "top" ? "bottom" : "top"]: "calc(100% + 6px)",
          background: "var(--surface-solid)",
          color: "var(--text)",
          border: "1px solid var(--border-strong)",
          boxShadow: "var(--glow-soft)",
          opacity: show ? 1 : 0,
        }}
      >
        {label}
      </span>
    </span>
  );
}
