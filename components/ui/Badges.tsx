import type { ConfidenceLabel, MilestoneStatus } from "@/lib/types";

const sizeMap = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-[11px] px-2 py-1",
  lg: "text-xs px-2.5 py-1",
};

export function StatusBadge({
  status,
  size = "md",
}: {
  status: MilestoneStatus | "MARGINAL";
  size?: keyof typeof sizeMap;
}) {
  const variants: Record<typeof status, { label: string; cls: string; dot: string }> = {
    ON_TRACK: {
      label: "ON TRACK",
      cls: "bg-[var(--color-mint-soft)] text-[var(--color-mint)] border-[var(--color-mint-dim)]/40",
      dot: "bg-[var(--color-mint)]",
    },
    SHORTFALL: {
      label: "SHORTFALL",
      cls: "bg-[var(--color-warn-soft)] text-[var(--color-warn)] border-[var(--color-warn-dim)]/40",
      dot: "bg-[var(--color-warn)]",
    },
    SURPLUS: {
      label: "SURPLUS",
      cls: "bg-[var(--color-cyan-soft)] text-[var(--color-cyan)] border-[var(--color-cyan-dim)]/40",
      dot: "bg-[var(--color-cyan)]",
    },
    MARGINAL: {
      label: "MARGINAL",
      cls: "bg-[var(--color-amber-soft)] text-[var(--color-amber)] border-[var(--color-amber-dim)]/40",
      dot: "bg-[var(--color-amber)]",
    },
  };
  const v = variants[status];
  return (
    <span
      className={`h-mono inline-flex items-center gap-1.5 rounded border ${v.cls} ${sizeMap[size]} font-medium tracking-wider`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} aria-hidden />
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
      ? "text-[var(--color-mint)] border-[var(--color-mint-dim)]/40 bg-[var(--color-mint-soft)]"
      : label === "Medium"
      ? "text-[var(--color-amber)] border-[var(--color-amber-dim)]/40 bg-[var(--color-amber-soft)]"
      : "text-[var(--color-warn)] border-[var(--color-warn-dim)]/40 bg-[var(--color-warn-soft)]";
  return (
    <span className={`h-mono inline-flex items-center gap-1.5 rounded border ${tone} ${sizeMap[size]} font-medium`}>
      <span className="opacity-70">CONF</span>
      <span>{level}%</span>
      <span className="opacity-60">·</span>
      <span className="uppercase tracking-wider">{label}</span>
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
    bull: { label: "BULL", cls: "text-[var(--color-mint)]" },
    base: { label: "BASE", cls: "text-[var(--color-cyan)]" },
    bear: { label: "BEAR", cls: "text-[var(--color-warn)]" },
  } as const;
  const v = map[scenario];
  const Cmp = onClick ? "button" : "span";
  return (
    <Cmp
      onClick={onClick}
      className={`h-mono rounded border px-2 py-1 text-[10px] tracking-[0.18em] transition-colors ${v.cls} ${
        active
          ? "bg-[var(--color-edge-strong)]/60 border-current"
          : "border-[var(--color-edge)] hover:border-[var(--color-edge-strong)]"
      }`}
    >
      {v.label}
    </Cmp>
  );
}

export function RiskTag({ band }: { band: string }) {
  return (
    <span className="h-mono rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-ink-mid)]">
      {band}
    </span>
  );
}
