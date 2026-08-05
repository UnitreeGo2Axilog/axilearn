"use client";

/**
 * A bench for the simulator and the notebook.
 *
 * Not a lesson and not linked from anywhere -- it exists so both can be driven
 * and looked at before any course content depends on them.
 */
import { SimNotebook } from "@/components/sim-notebook";
import { SIM_PARTS } from "@/content/sim-parts";

export default function SimTestPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-extrabold text-strong">Notebook bench</h1>
      {SIM_PARTS.map((part) => (
        <SimNotebook key={part.id} part={part} locale="en" accent="#22d3ee" />
      ))}
    </div>
  );
}
