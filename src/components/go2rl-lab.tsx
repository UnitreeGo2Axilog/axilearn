"use client";

/**
 * The lab's shell: the live background, the intro, and the map of parts.
 *
 * The background is loaded lazily and only here -- it is a three.js canvas,
 * and there is no sense shipping it to somebody reading a lesson. It sits
 * behind everything at low opacity so it never competes with code.
 */
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { Go2RlMap } from "@/components/go2rl-map";
import type { SimPart } from "@/content/sim-parts";
import type { Locale } from "@/content/types";

const PlexusBackground = dynamic(
  () => import("@/components/plexus-background").then((m) => m.PlexusBackground),
  { ssr: false },
);

export function Go2RlLab({
  parts,
  locale,
  trackId,
  accent,
  header,
}: {
  parts: SimPart[];
  locale: Locale;
  trackId: string;
  accent: string;
  header: ReactNode;
}) {
  return (
    <>
      <PlexusBackground />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8">
        {header}
        <Go2RlMap parts={parts} locale={locale} trackId={trackId} accent={accent} />
      </div>
    </>
  );
}
