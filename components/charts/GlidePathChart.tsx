"use client";

import type { GlidePoint } from "@/lib/types";

const colors = {
  equity: "var(--color-cyan)",
  debt: "var(--color-slate)",
  gold: "var(--color-amber)",
  liquid: "var(--color-mint)",
};

export function GlidePathChart({
  data,
  height = 180,
}: {
  data: GlidePoint[];
  height?: number;
}) {
  const w = 560;
  const h = height;
  const pad = { l: 36, r: 12, t: 10, b: 22 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;
  const minA = data[0].age;
  const maxA = data[data.length - 1].age;
  const x = (a: number) => pad.l + ((a - minA) / (maxA - minA)) * cw;
  const y = (v: number) => pad.t + ch - (v / 100) * ch;

  // Build stacked area paths
  const stacks: { key: keyof typeof colors; color: string }[] = [
    { key: "equity", color: colors.equity },
    { key: "debt", color: colors.debt },
    { key: "gold", color: colors.gold },
    { key: "liquid", color: colors.liquid },
  ];

  let cumPrev = data.map(() => 0);
  const paths = stacks.map((s) => {
    const top = data.map((p, i) => {
      const total = cumPrev[i] + (p[s.key] as number);
      return { age: p.age, top: total, bot: cumPrev[i] };
    });
    cumPrev = top.map((t) => t.top);
    const topPath = top.map((t, i) => `${i === 0 ? "M" : "L"} ${x(t.age).toFixed(1)} ${y(t.top).toFixed(1)}`).join(" ");
    const botPath = top
      .slice()
      .reverse()
      .map((t) => `L ${x(t.age).toFixed(1)} ${y(t.bot).toFixed(1)}`)
      .join(" ");
    return { d: `${topPath} ${botPath} Z`, color: s.color, key: s.key };
  });

  const yTicks = [0, 25, 50, 75, 100];
  const xTicks = data.map((d) => d.age);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--color-edge)" strokeDasharray="2 4" opacity={0.5} />
          <text x={pad.l - 6} y={y(t) + 3} fontSize={9} textAnchor="end" fill="var(--color-ink-dim)" className="h-mono">
            {t}%
          </text>
        </g>
      ))}
      {paths.map((p) => (
        <path key={p.key} d={p.d} fill={p.color} opacity={0.65} />
      ))}
      {paths.map((p) => {
        // top edge for each stack
        let cum = 0;
        const stackUp = stacks.findIndex((s) => s.key === p.key);
        const verts = data.map((d) => {
          let acc = 0;
          for (let i = 0; i <= stackUp; i++) acc += d[stacks[i].key] as number;
          cum = acc;
          return { age: d.age, val: cum };
        });
        const dPath = verts
          .map((v, i) => `${i === 0 ? "M" : "L"} ${x(v.age).toFixed(1)} ${y(v.val).toFixed(1)}`)
          .join(" ");
        return <path key={`${p.key}-line`} d={dPath} stroke={p.color} strokeWidth={1} fill="none" />;
      })}
      {xTicks.map((t) => (
        <text key={t} x={x(t)} y={h - pad.b + 14} fontSize={9} textAnchor="middle" fill="var(--color-ink-dim)" className="h-mono">
          {t}
        </text>
      ))}
    </svg>
  );
}
