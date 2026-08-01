"use client";

/**
 * The initials badge. See lib/avatar.ts for why it is not a photo.
 */
import { colorOf, initialsOf } from "@/lib/avatar";

export function Avatar({
  uid,
  displayName,
  email,
  size = 32,
  ring = false,
}: {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  size?: number;
  /** A visible border, for when the avatar sits on a busy background. */
  ring?: boolean;
}) {
  const color = colorOf(uid);
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-black leading-none"
      style={{
        width: size,
        height: size,
        // Tinted rather than solid: full-strength accent behind dark text is
        // loud at 32px and fights every other coloured thing in the header.
        background: `color-mix(in srgb, ${color} 22%, var(--surface-solid))`,
        color,
        border: ring ? `2px solid ${color}` : `1px solid color-mix(in srgb, ${color} 45%, transparent)`,
        fontSize: Math.round(size * 0.38),
      }}
    >
      {initialsOf(displayName, email)}
    </span>
  );
}
