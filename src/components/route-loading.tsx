/**
 * The instant pending state for page navigation.
 *
 * Every dynamic route on this platform awaits a Firestore-backed fetch
 * before it can render (roadmap, track briefing, lesson, certificate,
 * challenges, admin editors). Measured warm response times are fast --
 * 100-300ms -- but with NOTHING shown while that happens, the browser looks
 * frozen: the previous page just sits there, unresponsive, until the new one
 * is fully ready. Next's `loading.tsx` convention shows this the instant a
 * navigation starts, before any data has arrived, which is what actually
 * fixes the "feels slow" complaint -- the wait doesn't get shorter, but it
 * stops looking like nothing is happening.
 */
export function RouteLoading() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
        style={{ borderTopColor: "var(--neon)", borderRightColor: "var(--neon)" }}
      />
    </div>
  );
}
