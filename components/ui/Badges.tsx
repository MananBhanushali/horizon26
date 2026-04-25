import type { ConfidenceLabel, MilestoneStatus } from "@/lib/types";

const sizeMap = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-[11px] px-2.5 py-1",
  lg: "text-xs px-3 py-1",
};

export function StatusBadge({
  status,
  size = "md",
}: {
  status: MilestoneStatus | "MARGINAL";
  size?: keyof typeof sizeMap;
}) {
  const variants: Record<typeof status, { label: string; bg: string; fg: string; dot: string }> = {
    ON_TRACK: {
      label: "On track",
      bg: "var(--color-mint-soft)",
      fg: "var(--color-mint-dim)",
      dot: "var(--color-mint-dim)",
    },
    SHORTFALL: {
      label: "Shortfall",
      bg: "var(--color-warn-soft)",
      fg: "var(--color-warn-dim)",
      dot: "var(--color-warn-dim)",
    },
    SURPLUS: {
      label: "Surplus",
      bg: "var(--color-lavender-soft)",
      fg: "var(--color-cyan-dim)",
      dot: "var(--color-cyan-dim)",
    },
    MARGINAL: {
      label: "Marginal",
      bg: "var(--color-amber-soft)",
      fg: "var(--color-amber-dim)",
      dot: "var(--color-amber-dim)",
    },
  };
  const v = variants[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeMap[size]} font-medium`}
      style={{ background: v.bg, color: v.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: v.dot }} aria-hidden />
      {v.label}
    </span>
  );
}

export function ConfidenceBadge({
  level,
  label,
  size = "md",
}: {
  level: number;
  label: ConfidenceLabel;
  size?: keyof typeof sizeMap;
}) {
  const tone =
    label === "High"
      ? { bg: "var(--color-mint-soft)", fg: "var(--color-mint-dim)" }
      : label === "Medium"
      ? { bg: "var(--color-amber-soft)", fg: "var(--color-amber-dim)" }
      : { bg: "var(--color-warn-soft)", fg: "var(--color-warn-dim)" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeMap[size]} font-medium`}
      style={{ background: tone.bg, color: tone.fg }}
    >
      {level}% · {label}
    </span>
  );
}

export function ScenarioTag({
  scenario,
  active,
  onClick,
}: {
  scenario: "bull" | "base" | "bear";
  active?: boolean;
  onClick?: () => void;
}) {
  const map = {
    bull: { label: "Bull", color: "var(--color-mint-dim)" },
    base: { label: "Base", color: "var(--color-cyan-dim)" },
    bear: { label: "Bear", color: "var(--color-warn-dim)" },
  } as const;
  const v = map[scenario];
  const Cmp = onClick ? "button" : "span";
  return (
    <Cmp
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active ? "text-white" : ""
      }`}
      style={{
        background: active ? v.color : "var(--color-grid)",
        color: active ? "#fff" : v.color,
      }}
    >
      {v.label}
    </Cmp>
  );
}

export function RiskTag({ band }: { band: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--color-grid)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--color-ink-mid)]">
      {band}
    </span>
  );
}
