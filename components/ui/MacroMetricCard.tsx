import { formatSignedPercent } from "@/lib/format";

export function MacroMetricCard({
  label,
  value,
  unit,
  delta,
  trend,
  asOf,
  positiveDirection = "down",
}: {
  label: string;
  value: number | string;
  unit?: string;
  delta?: number; // signed delta
  trend?: number[];
  asOf?: string;
  positiveDirection?: "up" | "down"; // for inflation/repo, "down" is positive
}) {
  const goodDelta =
    delta === undefined
      ? null
      : positiveDirection === "down"
      ? delta < 0
      : delta > 0;

  const tone =
    goodDelta === null ? "text-[var(--color-ink-mid)]" : goodDelta ? "text-[var(--color-mint)]" : "text-[var(--color-warn)]";
  return (
    <div className="h-panel-raised flex flex-col gap-2 px-3.5 py-3">
      <div className="flex items-center justify-between">
        <span className="h-tick">{label}</span>
        {asOf && <span className="h-tick">{asOf}</span>}
      </div>
      <div className="flex items-end justify-between">
        <div className="h-mono text-2xl font-medium tracking-tight">
          {value}
          {unit && <span className="ml-1 text-base text-[var(--color-ink-mid)]">{unit}</span>}
        </div>
        {trend && <Spark data={trend} positive={goodDelta ?? true} />}
      </div>
      {delta !== undefined && (
        <div className={`h-mono text-[11px] ${tone}`}>
          {formatSignedPercent(delta, 2)} <span className="text-[var(--color-ink-dim)]">vs prev</span>
        </div>
      )}
    </div>
  );
}

function Spark({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 80;
  const h = 28;
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
  const fill = positive ? "var(--color-mint)" : "var(--color-warn)";
  return (
    <svg width={w} height={h} aria-hidden>
      <defs>
        <linearGradient id={`grad-${fill}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.3" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={fill} strokeWidth={1.25} opacity={0.9} />
    </svg>
  );
}
