import { ReactNode } from "react";

type Tone = "neutral" | "positive" | "negative" | "info" | "warning";

const toneCls: Record<Tone, string> = {
  neutral: "text-[var(--color-ink)]",
  positive: "text-[var(--color-mint)]",
  negative: "text-[var(--color-warn)]",
  info: "text-[var(--color-cyan)]",
  warning: "text-[var(--color-amber)]",
};

export function KPIStatCard({
  label,
  value,
  delta,
  tone = "neutral",
  hint,
  size = "md",
  trail,
}: {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  tone?: Tone;
  hint?: ReactNode;
  size?: "md" | "lg";
  trail?: number[];
}) {
  return (
    <div className="h-panel-raised group flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="h-tick">{label}</span>
        {trail && <Sparkline data={trail} />}
      </div>
      <div className={`h-mono ${size === "lg" ? "text-3xl" : "text-2xl"} font-medium tracking-tight ${toneCls[tone]}`}>
        {value}
      </div>
      <div className="flex items-center justify-between text-[11px]">
        {delta && <span className={`h-mono ${toneCls[tone]} opacity-90`}>{delta}</span>}
        {hint && <span className="text-[var(--color-ink-dim)] truncate">{hint}</span>}
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 56;
  const h = 18;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="text-[var(--color-cyan)]" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.75}
      />
    </svg>
  );
}
