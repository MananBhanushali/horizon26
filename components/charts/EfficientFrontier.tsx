"use client";

import type { EfficientFrontierPoint } from "@/lib/types";

export function EfficientFrontier({
  data,
  selected,
  height = 240,
}: {
  data: EfficientFrontierPoint[];
  selected: { risk: number; return: number };
  height?: number;
}) {
  const w = 560;
  const h = height;
  const pad = { l: 38, r: 16, t: 12, b: 26 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;

  const minR = Math.min(...data.map((p) => p.risk));
  const maxR = Math.max(...data.map((p) => p.risk));
  const minRet = Math.min(...data.map((p) => p.return));
  const maxRet = Math.max(...data.map((p) => p.return));

  const x = (r: number) => pad.l + ((r - minR) / (maxR - minR)) * cw;
  const y = (v: number) => pad.t + ch - ((v - minRet) / (maxRet - minRet)) * ch;

  const path = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.risk).toFixed(1)} ${y(p.return).toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Efficient frontier">
      {/* grid */}
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={`gx${p}`}
          x1={pad.l + p * cw}
          x2={pad.l + p * cw}
          y1={pad.t}
          y2={h - pad.b}
          stroke="var(--color-edge)"
          strokeDasharray="2 4"
          opacity={0.4}
        />
      ))}
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={`gy${p}`}
          x1={pad.l}
          x2={w - pad.r}
          y1={pad.t + p * ch}
          y2={pad.t + p * ch}
          stroke="var(--color-edge)"
          strokeDasharray="2 4"
          opacity={0.4}
        />
      ))}

      {/* curve */}
      <path d={path} fill="none" stroke="var(--color-cyan)" strokeWidth={1.5} />

      {/* points */}
      {data.map((p, i) => (
        <circle
          key={i}
          cx={x(p.risk)}
          cy={y(p.return)}
          r={1.6}
          fill="var(--color-cyan)"
          opacity={0.6}
        />
      ))}

      {/* selected */}
      <g>
        <line
          x1={x(selected.risk)}
          x2={x(selected.risk)}
          y1={pad.t}
          y2={h - pad.b}
          stroke="var(--color-amber)"
          strokeDasharray="3 3"
          opacity={0.6}
        />
        <line
          x1={pad.l}
          x2={w - pad.r}
          y1={y(selected.return)}
          y2={y(selected.return)}
          stroke="var(--color-amber)"
          strokeDasharray="3 3"
          opacity={0.6}
        />
        <circle cx={x(selected.risk)} cy={y(selected.return)} r={6} fill="none" stroke="var(--color-amber)" strokeWidth={1.5} />
        <circle cx={x(selected.risk)} cy={y(selected.return)} r={2.5} fill="var(--color-amber)" />
        <text
          x={x(selected.risk) + 8}
          y={y(selected.return) - 8}
          fontSize={10}
          fill="var(--color-amber)"
          className="h-mono"
        >
          You · {selected.return.toFixed(1)}% @ σ{selected.risk.toFixed(0)}
        </text>
      </g>

      {/* axis labels */}
      <text x={pad.l + cw / 2} y={h - 6} fontSize={9.5} textAnchor="middle" fill="var(--color-ink-dim)" className="h-mono">
        RISK · σ %
      </text>
      <text
        x={10}
        y={pad.t + ch / 2}
        fontSize={9.5}
        textAnchor="middle"
        fill="var(--color-ink-dim)"
        className="h-mono"
        transform={`rotate(-90, 10, ${pad.t + ch / 2})`}
      >
        EXPECTED RETURN %
      </text>
    </svg>
  );
}
