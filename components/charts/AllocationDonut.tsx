"use client";

import type { Allocation } from "@/lib/types";

const palette = {
  equity: "var(--color-cyan)",
  debt: "var(--color-slate)",
  gold: "var(--color-amber)",
  liquid: "var(--color-mint)",
};

export const allocationPalette = palette;

export function AllocationDonut({
  allocation,
  size = 220,
  thickness = 22,
  centerLabel,
  centerValue,
}: {
  allocation: Allocation;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const { equity, debt, gold, liquid } = allocation;
  const total = equity + debt + gold + liquid;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;

  const segs = [
    { key: "equity", val: equity, color: palette.equity },
    { key: "debt", val: debt, color: palette.debt },
    { key: "gold", val: gold, color: palette.gold },
    { key: "liquid", val: liquid, color: palette.liquid },
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-edge)" strokeWidth={thickness} opacity={0.4} />
      {segs.map((s) => {
        if (s.val === 0) return null;
        const len = (s.val / total) * C;
        const dasharray = `${len} ${C - len}`;
        const dashoffset = -offset;
        offset += len;
        return (
          <circle
            key={s.key}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
      {centerValue && (
        <>
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            className="h-mono"
            fontSize={20}
            fill="var(--color-ink)"
          >
            {centerValue}
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            fontSize={9.5}
            fill="var(--color-ink-dim)"
            className="h-mono"
            letterSpacing={1.5}
          >
            {(centerLabel ?? "ALLOCATION").toUpperCase()}
          </text>
        </>
      )}
    </svg>
  );
}

export function AllocationLegend({
  allocation,
  monthly,
}: {
  allocation: Allocation;
  monthly?: number;
}) {
  const items = [
    { key: "equity", label: "Equity", val: allocation.equity, color: palette.equity },
    { key: "debt", label: "Debt", val: allocation.debt, color: palette.debt },
    { key: "gold", label: "Gold", val: allocation.gold, color: palette.gold },
    { key: "liquid", label: "Liquid", val: allocation.liquid, color: palette.liquid },
  ];
  return (
    <ul className="flex flex-col gap-2">
      {items.map((i) => (
        <li
          key={i.key}
          className="flex items-center justify-between gap-3 rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} aria-hidden />
            <span className="text-[12px] text-[var(--color-ink)] truncate">{i.label}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="h-mono text-[13px]">{i.val}%</span>
            {monthly !== undefined && (
              <span className="h-mono text-[11px] text-[var(--color-ink-dim)]">
                Rs. {Math.round((i.val / 100) * monthly).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
