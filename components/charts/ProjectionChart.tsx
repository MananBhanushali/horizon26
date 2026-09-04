"use client";

import { useMemo, useState } from "react";
import type { ProjectionPoint, Milestone } from "@/lib/types";
import { formatINR } from "@/lib/format";

type Zoom = "5Y" | "10Y" | "ALL";

/**
 * Converts a series of points into a smooth SVG path using Catmull-Rom → Bézier conversion.
 * Tension = 0.3 gives a natural smooth curve without overshooting data points.
 */
function smoothPath(points: { x: number; y: number }[], tension = 0.3): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    // Catmull-Rom to cubic Bézier control points
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

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

  // Smooth curve paths using Catmull-Rom spline interpolation
  const toPoints = (key: "base" | "bull" | "bear" | "real") =>
    filtered.map((p) => ({ x: x(p.age), y: y(p[key]) }));

  /* eslint-disable react-hooks/exhaustive-deps */
  const basePath = useMemo(() => smoothPath(toPoints("base")), [filtered, minAge, maxAge, minV, maxV]);
  const bullPath = useMemo(() => smoothPath(toPoints("bull")), [filtered, minAge, maxAge, minV, maxV]);
  const bearPath = useMemo(() => smoothPath(toPoints("bear")), [filtered, minAge, maxAge, minV, maxV]);
  const realPath = useMemo(() => smoothPath(toPoints("real")), [filtered, minAge, maxAge, minV, maxV]);

  // Volatility cone band: fill between bull (top) and bear (bottom)
  const bandPath = useMemo(() => {
    if (filtered.length < 2) return "";
    const bullPts = toPoints("bull");
    const bearPts = toPoints("bear");
    // Forward along bull, backward along bear, close
    let d = `M ${bullPts[0].x.toFixed(1)} ${bullPts[0].y.toFixed(1)}`;
    for (let i = 1; i < bullPts.length; i++) {
      d += ` L ${bullPts[i].x.toFixed(1)} ${bullPts[i].y.toFixed(1)}`;
    }
    for (let i = bearPts.length - 1; i >= 0; i--) {
      d += ` L ${bearPts[i].x.toFixed(1)} ${bearPts[i].y.toFixed(1)}`;
    }
    d += " Z";
    return d;
  }, [filtered, minAge, maxAge, minV, maxV]);
  /* eslint-enable react-hooks/exhaustive-deps */

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

        {/* Volatility cone band (bull–bear fill) */}
        {showBand && (
          <path
            d={bandPath}
            fill="var(--color-cyan)"
            opacity={0.08}
          />
        )}

        {/* Scenario lines — smooth Catmull-Rom splines */}
        <path
          d={bullPath}
          fill="none"
          stroke="var(--color-mint)"
          strokeWidth={1}
          opacity={highlightScenario === "bull" ? 1 : 0.45}
        />
        <path
          d={bearPath}
          fill="none"
          stroke="var(--color-warn)"
          strokeWidth={1}
          opacity={highlightScenario === "bear" ? 1 : 0.45}
        />
        <path
          d={basePath}
          fill="none"
          stroke="var(--color-cyan)"
          strokeWidth={1.6}
          opacity={highlightScenario && highlightScenario !== "base" ? 0.5 : 1}
        />

        {/* Real (inflation-adjusted) line — dashed to distinguish from nominal */}
        <path
          d={realPath}
          fill="none"
          stroke="var(--color-amber, #f59e0b)"
          strokeWidth={1.2}
          strokeDasharray="4 3"
          opacity={0.7}
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
            {/* Real value dot on the dashed line */}
            <circle cx={x(hover.age)} cy={y(hover.pt.real)} r={2.5} fill="var(--color-amber, #f59e0b)" opacity={0.8} />
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1.5 text-[10px] text-[var(--color-ink-dim)] h-mono px-1">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-[var(--color-cyan)]" /> Nominal
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 border-t border-dashed border-[var(--color-amber,#f59e0b)]" /> Real (today&#39;s ₹)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-[var(--color-mint)] opacity-50" /> Bull
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-[var(--color-warn)] opacity-50" /> Bear
        </span>
      </div>

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
          <div className="text-[var(--color-amber,#f59e0b)]">Real {formatINR(hover.pt.real, { compact: true })}</div>
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
