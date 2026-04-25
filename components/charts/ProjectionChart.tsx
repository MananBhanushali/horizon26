"use client";

import { useMemo, useState } from "react";
import type { ProjectionPoint, Milestone } from "@/lib/types";
import { formatINR } from "@/lib/format";

type Zoom = "5Y" | "10Y" | "ALL";

export function ProjectionChart({
  data,
  milestones,
  startAge,
  zoom = "ALL",
  showBand = true,
  height = 300,
  onMilestoneClick,
  highlightScenario,
}: {
  data: ProjectionPoint[];
  milestones: Milestone[];
  startAge: number;
  zoom?: Zoom;
  showBand?: boolean;
  height?: number;
  onMilestoneClick?: (m: Milestone) => void;
  highlightScenario?: "bull" | "base" | "bear" | null;
}) {
  const filtered = useMemo(() => {
    if (zoom === "ALL") return data;
    const span = zoom === "5Y" ? 5 : 10;
    return data.filter((p) => p.age <= startAge + span);
  }, [data, zoom, startAge]);

  const w = 800;
  const h = height;
  const pad = { l: 56, r: 16, t: 14, b: 28 };
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;

  const allValues = filtered.flatMap((p) => [p.bull, p.base, p.bear]);
  const minV = 0;
  const maxV = Math.max(...allValues) * 1.05;
  const minAge = filtered[0]?.age ?? startAge;
  const maxAge = filtered[filtered.length - 1]?.age ?? startAge;

  const x = (age: number) => pad.l + ((age - minAge) / (maxAge - minAge || 1)) * chartW;
  const y = (v: number) => pad.t + chartH - ((v - minV) / (maxV - minV || 1)) * chartH;

  const linePath = (key: "base" | "bull" | "bear") =>
    filtered
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.age).toFixed(1)} ${y(p[key]).toFixed(1)}`)
      .join(" ");

  const bandPath = () => {
    const top = filtered.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.age).toFixed(1)} ${y(p.bull).toFixed(1)}`).join(" ");
    const bot = filtered
      .slice()
      .reverse()
      .map((p) => `L ${x(p.age).toFixed(1)} ${y(p.bear).toFixed(1)}`)
      .join(" ");
    return `${top} ${bot} Z`;
  };

  // y-axis ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = niceStep(maxV / 4);
    for (let v = 0; v <= maxV; v += step) ticks.push(v);
    return ticks;
  }, [maxV]);

  const xTicks = useMemo(() => {
    const span = maxAge - minAge;
    const step = span > 30 ? 10 : span > 15 ? 5 : span > 6 ? 2 : 1;
    const out: number[] = [];
    for (let a = Math.ceil(minAge); a <= maxAge; a += step) out.push(a);
    return out;
  }, [minAge, maxAge]);

  const [hover, setHover] = useState<{ age: number; v: number; pt: ProjectionPoint } | null>(null);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="w-full h-auto"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * w;
          if (px < pad.l || px > w - pad.r) {
            setHover(null);
            return;
          }
          const age = minAge + ((px - pad.l) / chartW) * (maxAge - minAge);
          const closest = filtered.reduce((a, b) =>
            Math.abs(a.age - age) < Math.abs(b.age - age) ? a : b
          );
          setHover({ age: closest.age, v: closest.base, pt: closest });
        }}
        role="img"
        aria-label="Projection chart"
      >
        {/* Grid */}
        <g aria-hidden>
          {yTicks.map((t) => (
            <line
              key={`y${t}`}
              x1={pad.l}
              x2={w - pad.r}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--color-edge)"
              strokeDasharray="2 4"
              opacity={0.55}
            />
          ))}
          {xTicks.map((t) => (
            <line
              key={`x${t}`}
              x1={x(t)}
              x2={x(t)}
              y1={pad.t}
              y2={h - pad.b}
              stroke="var(--color-edge)"
              strokeDasharray="2 4"
              opacity={0.45}
            />
          ))}
        </g>

        {/* Band */}
        {showBand && (
          <path
            d={bandPath()}
            fill="var(--color-cyan)"
            opacity={0.08}
          />
        )}

        {/* Lines */}
        <path
          d={linePath("bull")}
          fill="none"
          stroke="var(--color-mint)"
          strokeWidth={1}
          opacity={highlightScenario === "bull" ? 1 : 0.45}
        />
        <path
          d={linePath("bear")}
          fill="none"
          stroke="var(--color-warn)"
          strokeWidth={1}
          opacity={highlightScenario === "bear" ? 1 : 0.45}
        />
        <path
          d={linePath("base")}
          fill="none"
          stroke="var(--color-cyan)"
          strokeWidth={1.6}
          opacity={highlightScenario && highlightScenario !== "base" ? 0.5 : 1}
        />

        {/* Y-axis labels */}
        {yTicks.map((t) => (
          <text
            key={`yl${t}`}
            x={pad.l - 8}
            y={y(t) + 3}
            textAnchor="end"
            className="h-mono"
            fontSize={9.5}
            fill="var(--color-ink-dim)"
          >
            {formatINR(t, { compact: true })}
          </text>
        ))}
        {/* X-axis labels */}
        {xTicks.map((t) => (
          <text
            key={`xl${t}`}
            x={x(t)}
            y={h - pad.b + 14}
            textAnchor="middle"
            className="h-mono"
            fontSize={9.5}
            fill="var(--color-ink-dim)"
          >
            {t}
          </text>
        ))}

        {/* Milestones */}
        {milestones
          .filter((m) => m.age >= minAge && m.age <= maxAge)
          .map((m) => {
            const cx = x(m.age);
            const closest = filtered.reduce((a, b) =>
              Math.abs(a.age - m.age) < Math.abs(b.age - m.age) ? a : b
            );
            const cy = y(closest.base);
            const color =
              m.status === "ON_TRACK"
                ? "var(--color-mint)"
                : m.status === "SHORTFALL"
                ? "var(--color-warn)"
                : "var(--color-cyan)";
            return (
              <g
                key={m.id}
                onClick={() => onMilestoneClick?.(m)}
                style={{ cursor: onMilestoneClick ? "pointer" : "default" }}
                aria-label={`${m.name} at age ${m.age}: ${m.status}`}
              >
                <line x1={cx} x2={cx} y1={pad.t} y2={h - pad.b} stroke={color} strokeWidth={0.75} opacity={0.5} strokeDasharray="3 3" />
                <circle cx={cx} cy={cy} r={5.5} fill="var(--color-base)" stroke={color} strokeWidth={1.6} />
                <circle cx={cx} cy={cy} r={2.5} fill={color} />
              </g>
            );
          })}

        {/* Hover crosshair */}
        {hover && (
          <g>
            <line
              x1={x(hover.age)}
              x2={x(hover.age)}
              y1={pad.t}
              y2={h - pad.b}
              stroke="var(--color-cyan)"
              strokeWidth={1}
              opacity={0.5}
            />
            <circle cx={x(hover.age)} cy={y(hover.v)} r={3.5} fill="var(--color-cyan)" />
          </g>
        )}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute h-panel-raised text-[11px] h-mono px-2 py-1.5 leading-tight"
          style={{
            left: `${(x(hover.age) / w) * 100}%`,
            top: 8,
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-[var(--color-ink-dim)]">Age <span className="text-[var(--color-ink)]">{hover.age.toFixed(0)}</span></div>
          <div className="text-[var(--color-mint)]">Bull {formatINR(hover.pt.bull, { compact: true })}</div>
          <div className="text-[var(--color-cyan)]">Base {formatINR(hover.pt.base, { compact: true })}</div>
          <div className="text-[var(--color-warn)]">Bear {formatINR(hover.pt.bear, { compact: true })}</div>
        </div>
      )}
    </div>
  );
}

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const exp = Math.floor(Math.log10(raw));
  const base = Math.pow(10, exp);
  const m = raw / base;
  const rounded = m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10;
  return rounded * base;
}
