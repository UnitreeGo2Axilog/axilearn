"use client";

/**
 * Axi, the robot mascot.
 *
 * A pure-SVG character (no image files, so it scales sharply and costs
 * nothing to load) with a screen for a face. The screen displays whatever the
 * page wants -- "LOG IN", "SIGN UP", "WELCOME!" -- in the techy display font,
 * and the robot's expression reacts to what the learner is doing:
 *
 *   idle      -> calm blinking eyes, gentle float
 *   thinking  -> eyes look up, antenna pulses (while typing)
 *   happy     -> smiling eyes + a thumbs up (input looks good)
 *   celebrate -> big grin, arms up, sparkles (success)
 *   error     -> flat frowning eyes, head shake, thumbs down (something wrong)
 *
 * Everything is driven by the `mood` prop so any page can reuse it.
 */
import { useEffect, useState } from "react";

export type RobotMood = "idle" | "thinking" | "happy" | "celebrate" | "error";

interface Props {
  mood?: RobotMood;
  /** Text shown on the robot's screen (kept short -- it is a small display). */
  screenText?: string;
  className?: string;
}

const BODY = {
  idle: "#38bdf8",
  thinking: "#818cf8",
  happy: "#34d399",
  celebrate: "#fbbf24",
  error: "#fb7185",
} as const;

export function RobotMascot({ mood = "idle", screenText = "HELLO", className = "" }: Props) {
  const [pulse, setPulse] = useState(false);

  // Re-trigger the pop animation whenever the mood changes.
  useEffect(() => {
    setPulse(true);
    const id = setTimeout(() => setPulse(false), 400);
    return () => clearTimeout(id);
  }, [mood]);

  const color = BODY[mood];
  const shaking = mood === "error";
  const cheering = mood === "celebrate";

  return (
    <div
      className={`relative select-none ${className} ${
        shaking ? "animate-shake" : "animate-float"
      }`}
    >
      <svg viewBox="0 0 220 240" className="h-full w-full drop-shadow-xl">
        {/* antenna */}
        <line x1="110" y1="30" x2="110" y2="52" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
        <circle
          cx="110"
          cy="24"
          r="10"
          fill={color}
          className={mood === "thinking" ? "animate-pulse" : ""}
        />

        {/* arms -- raised when celebrating, thumb shapes otherwise */}
        <g stroke="#94a3b8" strokeWidth="9" strokeLinecap="round">
          <line x1="34" y1={cheering ? 118 : 150} x2="16" y2={cheering ? 86 : 176} />
          <line x1="186" y1={cheering ? 118 : 150} x2="204" y2={cheering ? 86 : 176} />
        </g>

        {/* head / screen bezel */}
        <rect x="26" y="52" width="168" height="122" rx="26" fill="#e2e8f0" />
        <rect x="26" y="52" width="168" height="122" rx="26" fill="none" stroke={color} strokeWidth="6" />

        {/* the screen */}
        <rect x="42" y="68" width="136" height="90" rx="16" fill="#0f172a" />

        {/* eyes */}
        {mood === "error" ? (
          <>
            <line x1="66" y1="98" x2="92" y2="110" stroke="#f87171" strokeWidth="7" strokeLinecap="round" />
            <line x1="154" y1="98" x2="128" y2="110" stroke="#f87171" strokeWidth="7" strokeLinecap="round" />
          </>
        ) : mood === "happy" || mood === "celebrate" ? (
          <>
            <path d="M64 110 q14 -18 28 0" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
            <path d="M128 110 q14 -18 28 0" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
          </>
        ) : (
          <g className="animate-blink" style={{ transformOrigin: "center" }}>
            <circle cx="78" cy={mood === "thinking" ? 98 : 104} r="10" fill={color} />
            <circle cx="142" cy={mood === "thinking" ? 98 : 104} r="10" fill={color} />
          </g>
        )}

        {/* mouth / screen text */}
        <text
          x="110"
          y="140"
          textAnchor="middle"
          className="font-robot"
          fontSize="17"
          letterSpacing="2"
          fill={color}
        >
          {screenText.slice(0, 12).toUpperCase()}
        </text>

        {/* scan line for a "live screen" feel */}
        <g clipPath="url(#screenClip)">
          <rect x="42" y="68" width="136" height="10" fill="white" opacity="0.06" className="animate-scan" />
        </g>
        <defs>
          <clipPath id="screenClip">
            <rect x="42" y="68" width="136" height="90" rx="16" />
          </clipPath>
        </defs>

        {/* body */}
        <rect x="56" y="180" width="108" height="46" rx="18" fill="#cbd5e1" />
        <rect x="56" y="180" width="108" height="46" rx="18" fill="none" stroke={color} strokeWidth="5" />
        <circle cx="88" cy="203" r="6" fill={color} />
        <circle cx="110" cy="203" r="6" fill="#94a3b8" />
        <circle cx="132" cy="203" r="6" fill="#94a3b8" />
      </svg>

      {/* reaction badge -- the thumbs up / down the learner reacts to */}
      {(mood === "happy" || mood === "celebrate" || mood === "error") && (
        <div
          key={`${mood}-${pulse}`}
          className="animate-pop absolute -right-1 top-6 grid h-14 w-14 place-items-center rounded-full bg-white text-3xl shadow-lg"
        >
          {mood === "error" ? "👎" : mood === "celebrate" ? "🎉" : "👍"}
        </div>
      )}

      {cheering && (
        <>
          <span className="absolute left-2 top-0 animate-wiggle text-2xl">✨</span>
          <span className="absolute right-4 top-10 animate-wiggle text-xl">⭐</span>
        </>
      )}
    </div>
  );
}
