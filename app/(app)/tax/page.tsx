"use client";

import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { PageHeader } from "@/components/PageHeader";
import { KPIStatCard } from "@/components/ui/KPIStatCard";
import { formatINR } from "@/lib/format";

export default function TaxPage() {
  const { persona } = useApp();
  const tb = persona.taxBreakdown;
  const total80c = tb.section80c + tb.section80ccd1b;
  const limit = 200000; // 1.5L + 50K
  const utilPct = Math.min(100, Math.round((total80c / limit) * 100));

  return (
    <>
      <PageHeader
        eyebrow="TAX IMPACT"
        title="Pre-tax vs post-tax · India FY 2025-26"
        subtitle="LTCG / STCG / debt slab / 80C / 80CCD(1B) — applied to base scenario"
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPIStatCard
          label="PRE-TAX RETURN"
          value={`${persona.preTaxReturn.toFixed(1)}%`}
          delta="BL implied"
          tone="info"
          size="lg"
        />
        <KPIStatCard
          label="POST-TAX RETURN"
          value={`${persona.postTaxReturn.toFixed(1)}%`}
          delta={`-${persona.taxDrag.toFixed(1)}pp drag`}
          tone="positive"
          size="lg"
        />
        <KPIStatCard
          label="ANNUAL TAX BILL"
          value={formatINR(tb.netTax, { compact: true })}
          delta={`LTCG ${formatINR(tb.ltcg, { compact: true })}`}
          tone="warning"
          size="lg"
        />
        <KPIStatCard
          label="80C UTILIZATION"
          value={`${utilPct}%`}
          delta={`${formatINR(total80c, { compact: true })} of Rs. 2 L`}
          tone={utilPct >= 90 ? "positive" : "warning"}
          size="lg"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4">
        <TerminalPanel title="TAX DRAG VISUALIZATION" subtitle="pre-tax vs post-tax compounding">
          <DragChart pre={persona.preTaxReturn} post={persona.postTaxReturn} />
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] h-mono">
            <Cell label="Pre-tax CAGR" value={`${persona.preTaxReturn.toFixed(1)}%`} tone="info" />
            <Cell label="Post-tax CAGR" value={`${persona.postTaxReturn.toFixed(1)}%`} tone="ok" />
          </div>
          <p className="mt-3 text-[12px] leading-snug text-[var(--color-ink-mid)]">
            Tax-efficient instrument routing (ELSS for 80C, NPS for 80CCD(1B), SGB for gold) shaves drag by an estimated 0.4-0.6pp over a slab-only baseline.
          </p>
        </TerminalPanel>

        <TerminalPanel title="ANNUAL BREAKDOWN" subtitle="rupee impact at current AUM">
          <ul className="flex flex-col gap-2 text-[12.5px]">
            <Row label="LTCG (equity > 1Y, 12.5% > Rs. 1.25 L)" value={tb.ltcg} tone="negative" />
            <Row label="STCG (equity ≤ 1Y, 20%)" value={tb.stcg} tone="negative" />
            <Row label="Debt fund (slab rate)" value={tb.debtTax} tone="negative" />
            <Row label="80C deduction (ELSS / PPF / NPS)" value={-tb.section80c} tone="positive" hint="Rs. 1.5 L cap" />
            <Row label="80CCD(1B) (NPS extra)" value={-tb.section80ccd1b} tone="positive" hint="Rs. 50 K cap" />
            <li className="border-t border-[var(--color-edge)] mt-1 pt-2 flex items-center justify-between">
              <span className="font-medium">Net annual tax</span>
              <span className="h-mono text-[var(--color-warn)]">{formatINR(tb.netTax)}</span>
            </li>
          </ul>
        </TerminalPanel>
      </section>

      <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalPanel title="80C / 80CCD UTILIZATION">
          <Util label="80C" value={tb.section80c} cap={150000} />
          <Util label="80CCD(1B)" value={tb.section80ccd1b} cap={50000} />
          <p className="mt-3 text-[12px] text-[var(--color-ink-mid)] leading-snug">
            ELSS, PPF, NPS, SCSS, life insurance premiums, and home loan principal all qualify under 80C up to Rs. 1.5 L. NPS contributions claim a separate Rs. 50 K under 80CCD(1B).
          </p>
        </TerminalPanel>

        <TerminalPanel title="TAX-EFFICIENT NEXT MOVE">
          <ul className="flex flex-col gap-2">
            {recommendations(persona.id).map((r, i) => (
              <li key={i} className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{r.title}</div>
                  <span className="h-mono text-[10px] uppercase tracking-wider rounded border border-[var(--color-mint-dim)]/40 bg-[var(--color-mint-soft)] px-1.5 py-0.5 text-[var(--color-mint)]">
                    {r.tag}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-[var(--color-ink-mid)] leading-snug">{r.body}</p>
              </li>
            ))}
          </ul>
        </TerminalPanel>
      </section>
    </>
  );
}

function Row({ label, value, tone, hint }: { label: string; value: number; tone: "positive" | "negative"; hint?: string }) {
  const cls = tone === "positive" ? "text-[var(--color-mint)]" : "text-[var(--color-warn)]";
  const sign = value < 0 ? "-" : "";
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="min-w-0 truncate">
        {label} {hint && <span className="text-[10px] text-[var(--color-ink-dim)] ml-1">({hint})</span>}
      </span>
      <span className={`h-mono ${cls}`}>{sign}{formatINR(Math.abs(value))}</span>
    </li>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: "info" | "ok" }) {
  const cls = tone === "info" ? "text-[var(--color-cyan)]" : tone === "ok" ? "text-[var(--color-mint)]" : "";
  return (
    <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5">
      <div className="h-tick">{label}</div>
      <div className={`h-mono text-[13px] mt-0.5 ${cls}`}>{value}</div>
    </div>
  );
}

function Util({ label, value, cap }: { label: string; value: number; cap: number }) {
  const pct = Math.min(100, Math.round((value / cap) * 100));
  return (
    <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2 mb-2">
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-medium">{label}</span>
        <span className="h-mono text-[var(--color-ink-mid)]">
          {formatINR(value, { compact: true })} / {formatINR(cap, { compact: true })}
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded bg-[var(--color-base)] overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, background: pct >= 90 ? "var(--color-mint)" : "var(--color-amber)" }} />
      </div>
      <div className="h-tick mt-1">{pct}% utilized</div>
    </div>
  );
}

function DragChart({ pre, post }: { pre: number; post: number }) {
  const years = 30;
  const w = 560;
  const h = 200;
  const pad = { l: 38, r: 12, t: 12, b: 22 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;
  const series = (rate: number) => {
    const out: { x: number; y: number; v: number }[] = [];
    let v = 1;
    for (let i = 0; i <= years; i++) {
      out.push({ x: i, y: 0, v });
      v *= 1 + rate / 100;
    }
    return out;
  };
  const a = series(pre);
  const b = series(post);
  const max = a[a.length - 1].v;
  const xs = (i: number) => pad.l + (i / years) * cw;
  const ys = (v: number) => pad.t + ch - (v / max) * ch;
  const path = (d: typeof a) => d.map((p, i) => `${i === 0 ? "M" : "L"} ${xs(p.x).toFixed(1)} ${ys(p.v).toFixed(1)}`).join(" ");
  const fillBetween = () => {
    const top = a.map((p, i) => `${i === 0 ? "M" : "L"} ${xs(p.x).toFixed(1)} ${ys(p.v).toFixed(1)}`).join(" ");
    const bot = b.slice().reverse().map((p) => `L ${xs(p.x).toFixed(1)} ${ys(p.v).toFixed(1)}`).join(" ");
    return `${top} ${bot} Z`;
  };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <path d={fillBetween()} fill="var(--color-warn)" opacity={0.18} />
      <path d={path(a)} fill="none" stroke="var(--color-cyan)" strokeWidth={1.5} />
      <path d={path(b)} fill="none" stroke="var(--color-mint)" strokeWidth={1.5} />
      {[0, 10, 20, 30].map((t) => (
        <text key={t} x={xs(t)} y={h - 6} fontSize={9} textAnchor="middle" fill="var(--color-ink-dim)" className="h-mono">
          {t}y
        </text>
      ))}
      <text x={xs(years) - 4} y={ys(a[a.length - 1].v) - 6} fontSize={10} textAnchor="end" fill="var(--color-cyan)" className="h-mono">
        Pre-tax · {a[a.length - 1].v.toFixed(1)}x
      </text>
      <text x={xs(years) - 4} y={ys(b[b.length - 1].v) + 14} fontSize={10} textAnchor="end" fill="var(--color-mint)" className="h-mono">
        Post-tax · {b[b.length - 1].v.toFixed(1)}x
      </text>
    </svg>
  );
}

function recommendations(personaId: string): { title: string; body: string; tag: string }[] {
  const map: Record<string, { title: string; body: string; tag: string }[]> = {
    riya: [
      { title: "Top up ELSS to Rs. 18 K/yr", body: "Locks 80C deduction at student-level slab; 3-yr lock-in is fine at your horizon.", tag: "80C" },
      { title: "Defer realizations past 1 year", body: "Convert STCG (20%) into LTCG (12.5%) by holding > 12 months.", tag: "LTCG" },
    ],
    aditya: [
      { title: "Max NPS Tier-1 to Rs. 50 K", body: "Standalone Rs. 50 K deduction beyond 80C; auto-glide path included.", tag: "80CCD" },
      { title: "Harvest LTCG up to Rs. 1.25 L/yr", body: "Realize equity gains annually within exemption to reset cost basis.", tag: "LTCG" },
      { title: "Hold debt funds in lower-slab spouse", body: "Income split if marginal slabs differ — note clubbing rules.", tag: "DEBT" },
    ],
    priya: [
      { title: "Route bonus into PPF (Rs. 1.5 L)", body: "Sovereign-backed, EEE; aligns with retirement bucket horizon.", tag: "80C" },
      { title: "Use SGB for gold sleeve", body: "LTCG exempt at maturity (8 yr); 2.5% coupon offsets debt taxation.", tag: "GOLD" },
    ],
    vikram: [
      { title: "Front-load ELSS for catch-up", body: "Maximum equity exposure with tax shield; lock-in tolerable at 18-yr horizon.", tag: "80C" },
      { title: "NPS LC50 tier", body: "Rs. 50 K extra deduction; locked till 60 (matches retirement age).", tag: "80CCD" },
    ],
    raj: [
      { title: "Shift gilts to PPF top-up", body: "Tax-free maturity vs slab on debt funds.", tag: "PPF" },
      { title: "Begin equity-LTCG harvesting now", body: "Reset cost basis pre-retirement to reduce post-retirement tax bill.", tag: "LTCG" },
    ],
    sharma: [
      { title: "SCSS quarterly payout", body: "Sovereign 8.2% yield; preferable to debt fund at slab rate.", tag: "INCOME" },
      { title: "Arbitrage ladder for liquid", body: "Equity-taxation (12.5%) on near-cash; better than slab on overnight.", tag: "ARB" },
    ],
  };
  return map[personaId] ?? map.aditya;
}
