/**
 * A learner's avatar, derived rather than uploaded.
 *
 * No photo upload, on purpose. The audience is teenagers, and accepting
 * images of minors means storage, moderation, and a duty of care over
 * pictures of children -- a serious commitment to take on for a decoration.
 * Initials on a colour cost nothing, need no storage, cannot be abused, and
 * are what most of these products settle on anyway.
 *
 * The colour is derived from the uid, so it is stable for life: the same
 * person is the same colour on every device, every session, with nothing
 * stored anywhere. Two learners can collide, which is fine -- the initials
 * and the name beside them do the identifying; the colour only makes the
 * avatar findable at a glance.
 */

/** The platform's own accents, so an avatar never looks pasted in. */
const PALETTE = [
  "#22d3ee", // neon
  "#fb923c", // python
  "#a78bfa", // advanced
  "#f472b6", // games
  "#a3e635", // cleared
  "#fbbf24", // reward
];

/**
 * Up to two initials. Falls back to the email's first letter, then to a
 * dash -- an empty circle looks broken, and "?" reads as an error.
 */
export function initialsOf(displayName?: string | null, email?: string | null): string {
  const name = (displayName ?? "").trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
    return letters.toUpperCase();
  }
  const at = (email ?? "").trim();
  if (at) return at[0].toUpperCase();
  return "–";
}

/**
 * A stable colour for a uid.
 *
 * FNV-1a rather than a sum of char codes: a sum gives anagrams and
 * transpositions the same colour, which for sequential Firebase uids means
 * visible clustering.
 */
export function colorOf(seed: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
