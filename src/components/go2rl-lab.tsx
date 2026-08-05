"use client";

/**
 * The lab's shell: the live background, and the parts stacked in order.
 *
 * The background is loaded lazily and only here, for the same reason the
 * challenges page does it: it is a three.js canvas, and there is no sense
 * shipping it to somebody reading a lesson. It also sits behind everything at
 * a low opacity so it never competes with code the learner is trying to read.
 */
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { SimNotebook } from "@/components/sim-notebook";
import type { SimPart } from "@/content/sim-parts";
import type { Locale } from "@/content/types";

const PlexusBackground = dynamic(
  () => import("@/components/plexus-background").then((m) => m.PlexusBackground),
  { ssr: false },
);

export function Go2RlLab({
  parts,
  locale,
  accent,
  header,
}: {
  parts: SimPart[];
  locale: Locale;
  accent: string;
  header: ReactNode;
}) {
  return (
    <>
      <PlexusBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        {header}
        <div className="mt-6 space-y-6">
          {parts.map((part, i) => (
            <div key={part.id}>
              <p className="mb-1.5 font-robot text-[11px] font-bold tracking-[0.18em] text-faint">
                {String(i + 1).padStart(2, "0")}
              </p>
              <SimNotebook part={part} locale={locale} accent={accent} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
