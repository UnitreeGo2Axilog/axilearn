"use client";

/**
 * Axi, the robot mascot.
 *
 * Pure SVG (no image files, no emoji): the reactions are DRAWN as part of the
 * character -- a real thumbs-up hand, a drawn frown, drawn sparkles -- because
 * pasting emoji stickers on top of a vector robot looked cheap and mixed two
 * different art styles.
 *
 * Moods:
 *   idle      calm blinking eyes, gentle float
 *   thinking  eyes look up, antenna pulses (while the learner types)
 *   happy     smiling eyes + a drawn thumbs-up
 *   celebrate big grin, both arms raised, drawn sparkles
 *   error     frowning eyes, head shake, drawn thumbs-down
 */
import { useEffect, useState } from "react";

export type RobotMood = "idle" | "thinking" | "happy" | "celebrate" | "error";

interface Props {
  mood?: RobotMood;
  /** Short text shown on the robot's screen. */
  screenText?: string;
  className?: string;
}

const COLOR = {
  idle: "#38bdf8",
  thinking: "#818cf8",
  happy: "#34d399",
  celebrate: "#fbbf24",
  error: "#fb7185",
} as const;

/** A drawn hand giving a thumbs up (or down when flipped). */
function ThumbHand({ down = false, color }: { down?: boolean; color: string }) {
  return (
    <g transform={down ? "rotate(180 0 0)" : undefined}>
      {/* fist */}
      <rect x="-13" y="-6" width="26" height="22" rx="8" fill="#f1f5f9" stroke={color} strokeWidth="3" />
      {/* thumb */}
      <path
        d="M -6 -6 L -6 -18 a 6 6 0 0 1 12 0 L 6 -6"
        fill="#f1f5f9"
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* knuckle lines */}
      <line x1="-4" y1="4" x2="8" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </g>
  );
}

function Sparkle({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <path
      d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z"
      transform={`translate(${x} ${y}) scale(${s})`}
      fill="#fde68a"
      className="animate-wiggle"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

export function RobotMascot({ mood = "idle", screenText = "HELLO", className = "" }: Props) {
  const [key, setKey] = useState(0);
  useEffect(() => setKey((k) => k + 1), [mood]);

  const color = COLOR[mood];
  const isError = mood === "error";
  const cheering = mood === "celebrate";
  const showThumb = mood === "happy" || isError;

  return (
    <div className={`relative select-none ${className} ${isError ? "animate-shake" : "animate-float"}`}>
      <svg viewBox="0 0 240 250" className="h-full w-full drop-shadow-xl">
        {/* antenna */}
        <line x1="120" y1="34" x2="120" y2="56" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
        <circle cx="120" cy="27" r="10" fill={color} className={mood === "thinking" ? "animate-pulse" : ""} />

        {/* left arm */}
        <g stroke="#94a3b8" strokeWidth="9" strokeLinecap="round">
          <line x1="44" y1="122" x2={cheering ? 22 : 26} y2={cheering ? 84 : 158} />
          {!cheering && <line x1="196" y1="122" x2={showThumb ? 214 : 214} y2={showThumb ? 130 : 158} />}
          {cheering && <line x1="196" y1="122" x2="218" y2="84" />}
        </g>

        {/* drawn hand reaction on the right arm */}
        {showThumb && (
          <g key={key} transform="translate(216 122)" className="animate-pop">
            <ThumbHand down={isError} color={color} />
          </g>
        )}

        {/* head */}
        <rect x="36" y="56" width="168" height="122" rx="26" fill="#e2e8f0" />
        <rect x="36" y="56" width="168" height="122" rx="26" fill="none" stroke={color} strokeWidth="6" />

        {/* screen */}
        <rect x="52" y="72" width="136" height="90" rx="16" fill="#0f172a" />

        {/* eyes */}
        {isError ? (
          <>
            <line x1="76" y1="100" x2="102" y2="112" stroke={color} strokeWidth="7" strokeLinecap="round" />
            <line x1="164" y1="100" x2="138" y2="112" stroke={color} strokeWidth="7" strokeLinecap="round" />
          </>
        ) : mood === "happy" || cheering ? (
          <>
            <path d="M74 112 q14 -18 28 0" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
            <path d="M138 112 q14 -18 28 0" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
          </>
        ) : (
          <g className="animate-blink" style={{ transformOrigin: "center" }}>
            <circle cx="88" cy={mood === "thinking" ? 100 : 106} r="10" fill={color} />
            <circle cx="152" cy={mood === "thinking" ? 100 : 106} r="10" fill={color} />
          </g>
        )}

        {/* screen text */}
        <text
          x="120"
          y="144"
          textAnchor="middle"
          className="font-robot"
          fontSize="16"
          letterSpacing="2"
          fill={color}
        >
          {screenText.slice(0, 12).toUpperCase()}
        </text>

        {/* scanline */}
        <g clipPath="url(#axiScreen)">
          <rect x="52" y="72" width="136" height="10" fill="white" opacity="0.06" className="animate-scan" />
        </g>
        <defs>
          <clipPath id="axiScreen">
            <rect x="52" y="72" width="136" height="90" rx="16" />
          </clipPath>
        </defs>

        {/* body */}
        <rect x="66" y="184" width="108" height="46" rx="18" fill="#cbd5e1" />
        <rect x="66" y="184" width="108" height="46" rx="18" fill="none" stroke={color} strokeWidth="5" />
        <circle cx="98" cy="207" r="6" fill={color} />
        <circle cx="120" cy="207" r="6" fill="#94a3b8" />
        <circle cx="142" cy="207" r="6" fill="#94a3b8" />

        {/* drawn sparkles when celebrating */}
        {cheering && (
          <>
            <Sparkle x={38} y={62} s={1.1} />
            <Sparkle x={206} y={54} s={0.8} delay={0.3} />
            <Sparkle x={192} y={186} s={0.7} delay={0.6} />
          </>
        )}
      </svg>
    </div>
  );
}
