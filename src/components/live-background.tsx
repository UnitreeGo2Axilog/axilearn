"use client";

/**
 * The animated plexus, on every page reached from the account menu.
 *
 * It was written for the challenges page and lazily loaded there, because
 * there was no reason for the rest of the site to pay for a Three.js bundle.
 * That reasoning still holds -- this is the same lazy import, so a lesson or
 * the map still never downloads it. What changed is which pages want it:
 * homework, discussion, progress, bookmarks and certificates are the screens
 * a learner lands on between lessons, and they were flat panels on a flat
 * background while the challenges page moved.
 *
 * One component rather than seven copies of the dynamic() call, so the chunk
 * is shared and there is one place to change if it ever needs to stop.
 */
import dynamic from "next/dynamic";

const Plexus = dynamic(
  () => import("@/components/plexus-background").then((m) => m.PlexusBackground),
  { ssr: false },
);

export function LiveBackground() {
  return <Plexus />;
}
