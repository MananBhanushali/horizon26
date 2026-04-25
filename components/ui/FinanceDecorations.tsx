"use client";

// Scattered pastel finance SVG decorations layered behind the login card.
// Pure visual — pointer-events:none, aria-hidden.

type Spot = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rotate?: number;
  size: number;
  opacity?: number;
  color: string;
  shape: "rupee" | "bars" | "pie" | "coin" | "trend" | "donut";
};

const SPOTS: Spot[] = [
  { top: "8%", left: "6%", rotate: -12, size: 64, color: "#a3aef5", shape: "rupee", opacity: 0.55 },
  { top: "14%", right: "8%", rotate: 8, size: 80, color: "#feb3ff", shape: "bars", opacity: 0.5 },
  { top: "32%", left: "3%", rotate: 18, size: 56, color: "#34c08a", shape: "trend", opacity: 0.55 },
  { bottom: "16%", right: "5%", rotate: -10, size: 72, color: "#f0a93f", shape: "pie", opacity: 0.5 },
  { bottom: "8%", left: "8%", rotate: 4, size: 60, color: "#a8d5ba", shape: "coin", opacity: 0.55 },
  { top: "55%", right: "3%", rotate: 14, size: 52, color: "#c8c8ff", shape: "donut", opacity: 0.55 },
  { bottom: "32%", left: "22%", rotate: -6, size: 44, color: "#e3b3d4", shape: "rupee", opacity: 0.45 },
  { top: "70%", right: "22%", rotate: 22, size: 48, color: "#7a87df", shape: "trend", opacity: 0.5 },
];

export default function FinanceDecorations() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
        overflow: "hidden",
      }}
    >
      {SPOTS.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: s.top,
            bottom: s.bottom,
            left: s.left,
            right: s.right,
            width: s.size,
            height: s.size,
            transform: `rotate(${s.rotate ?? 0}deg)`,
            opacity: s.opacity ?? 0.5,
          }}
        >
          <Shape shape={s.shape} color={s.color} />
        </div>
      ))}
    </div>
  );
}

function Shape({ shape, color }: { shape: Spot["shape"]; color: string }) {
  switch (shape) {
    case "rupee":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.18" />
          <text
            x="32"
            y="44"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="40"
            fontWeight="700"
            fill={color}
          >
            ₹
          </text>
        </svg>
      );
    case "bars":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
          <rect x="6" y="2" width="52" height="60" rx="14" fill={color} opacity="0.18" />
          <rect x="14" y="36" width="8" height="18" rx="3" fill={color} />
          <rect x="28" y="24" width="8" height="30" rx="3" fill={color} />
          <rect x="42" y="14" width="8" height="40" rx="3" fill={color} />
        </svg>
      );
    case "trend":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
          <rect x="2" y="2" width="60" height="60" rx="14" fill={color} opacity="0.18" />
          <path
            d="M10 44 L24 28 L34 36 L52 14"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M44 14 L52 14 L52 22" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case "pie":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
          <circle cx="32" cy="32" r="26" fill={color} opacity="0.2" />
          <path
            d="M32 32 L32 6 A26 26 0 0 1 56 38 Z"
            fill={color}
          />
        </svg>
      );
    case "coin":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
          <circle cx="32" cy="32" r="28" fill={color} opacity="0.25" />
          <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="3" fill="none" />
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="20"
            fontWeight="700"
            fill={color}
          >
            ₹
          </text>
        </svg>
      );
    case "donut":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
          <circle cx="32" cy="32" r="26" fill={color} opacity="0.18" />
          <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="6" strokeDasharray="35 100" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="6" strokeDasharray="20 100" strokeDashoffset="-40" strokeLinecap="round" fill="none" opacity="0.6" />
        </svg>
      );
  }
}
