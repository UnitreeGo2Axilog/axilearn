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
 *
 * PORTALED TO document.body, not rendered inline next to the trigger. The
 * first version was a plain `position: absolute` span next to its trigger,
 * and that broke in two ways that both come down to the same cause -- a
 * CSS-positioned tooltip is still a normal descendant, so its ancestors can
 * clip or misplace it:
 *
 *  - Icons inside a card with `overflow-hidden` (the track cards' corner
 *    badges) had their tooltip silently cut off by that card's own clipping
 *    box. z-index does not rescue you here -- clipping and paint order are
 *    different mechanisms, and no z-index escapes an ancestor's overflow.
 *  - Icons near the top of the viewport (the header) defaulted to opening
 *    upward with nowhere to go, pushing the label above the visible window.
 *
 * A portal escapes both: painted as a sibling of the whole page, not nested
 * inside whatever container the trigger happens to sit in, so no ancestor's
 * overflow can touch it. Position is computed from the trigger's own
 * on-screen rectangle and flips to whichever side actually has room --
 * above by default, below if there is no space above, and clamped
 * horizontally so it can never run off the left or right edge either.
 */
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SHOW_DELAY_MS = 450;
const GAP = 8; // clearance between the trigger and the label
const EDGE = 8; // minimum clearance from any viewport edge

interface Position {
  top: number;
  left: number;
  placement: "top" | "bottom";
}

export function Tooltip({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactElement;
  /**
   * Extra classes for the WRAPPER span, not the child.
   *
   * The wrapper is a real element in the layout, and that is easy to forget
   * because it is invisible. A `flex-1` trigger sizes itself against this
   * span rather than against the row the caller put it in -- and the span is
   * an `inline-flex` containing only that trigger, so the two collapse into
   * each other and the control disappears. That is precisely how the lesson
   * step bar vanished. Callers laying out inside a flex or grid pass their
   * sizing here.
   */
  className?: string;
}) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<Position | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function open() {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    // Prefer above; only drop below when there truly is no room above --
    // this is what keeps header-level icons from opening off the top edge.
    const placement: Position["placement"] = rect.top < 48 ? "bottom" : "top";
    setPos({
      top: placement === "top" ? rect.top - GAP : rect.bottom + GAP,
      left: centerX,
      placement,
    });
    setShow(true);
  }
  function schedule() {
    timer.current = setTimeout(open, SHOW_DELAY_MS);
  }
  function cancel() {
    if (timer.current) clearTimeout(timer.current);
    setShow(false);
  }

  return (
    <span
      ref={wrapRef}
      className={`relative inline-flex${className ? ` ${className}` : ""}`}
      onMouseEnter={schedule}
      onMouseLeave={cancel}
      onFocus={open}
      onBlur={cancel}
    >
      {children}
      {show && pos && <TooltipBubble label={label} pos={pos} />}
    </span>
  );
}

/**
 * The floating label itself, portaled to the body. Renders once off-screen
 * first to measure its own width (needed to clamp it inside the viewport),
 * then repositions -- two paints, both before the browser shows anything,
 * via useLayoutEffect, so there is no visible jump.
 */
function TooltipBubble({ label, pos }: { label: string; pos: Position }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [left, setLeft] = useState(pos.left);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const width = el.offsetWidth;
    const min = EDGE + width / 2;
    const max = window.innerWidth - EDGE - width / 2;
    setLeft(Math.min(Math.max(pos.left, min), max));
    setReady(true);
  }, [pos.left]);

  if (typeof document === "undefined") return null;

  // A single computed transform, not a mix of Tailwind's translate utility
  // and an inline one -- centers horizontally always, and for "top" shifts
  // up by the bubble's own height so its BOTTOM edge lands at pos.top
  // without ever needing to know the viewport height.
  const translateY = pos.placement === "top" ? "-100%" : "0%";

  return createPortal(
    <span
      role="tooltip"
      ref={ref}
      className="pointer-events-none fixed z-[100] whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold transition-opacity duration-150"
      style={{
        top: pos.top,
        left,
        transform: `translate(-50%, ${translateY})`,
        background: "var(--surface-solid)",
        color: "var(--text)",
        border: "1px solid var(--border-strong)",
        boxShadow: "var(--glow-soft)",
        opacity: ready ? 1 : 0,
      }}
    >
      {label}
    </span>,
    document.body,
  );
}
