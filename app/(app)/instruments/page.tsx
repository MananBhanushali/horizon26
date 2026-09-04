"use client";

import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RiskTag } from "@/components/ui/Badges";
import { formatINR } from "@/lib/format";
import type { Instrument } from "@/lib/types";

const categoryColor: Record<Instrument["category"], string> = {
  Equity: "var(--color-cyan)",
  Debt: "var(--color-slate)",
  Gold: "var(--color-amber)",
  Liquid: "var(--color-mint)",
};

export default function InstrumentsPage() {
  const { persona } = useApp();
  const totals = persona.instruments.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + i.monthly;
    return acc;
  }, {});

  const columns: Column<Instrument>[] = [
    {
      key: "name",
      label: "INSTRUMENT",
      sortBy: (r) => r.name,
      render: (r) => (
        <div>
          <div className="font-medium text-[12.5px]">{r.name}</div>
          <div className="text-[10.5px] text-[var(--color-ink-dim)] h-mono">{r.subCategory}</div>
        </div>
      ),
    },
    {
      key: "category",
      label: "CAT",
      width: "70px",
      sortBy: (r) => r.category,
      render: (r) => (
        <span
          className="h-mono text-[10.5px] tracking-wider rounded border px-1.5 py-0.5"
          style={{ color: categoryColor[r.category], borderColor: `${categoryColor[r.category]}55` }}
        >
          {r.category.slice(0, 3).toUpperCase()}
        </span>
      ),
    },
    {
      key: "monthly",
      label: "RS./MO",
      width: "100px",
      align: "right",
      sortBy: (r) => r.monthly,
      render: (r) => <span className="h-mono">{r.monthly === 0 ? "—" : formatINR(r.monthly)}</span>,
    },
    {
      key: "riskBand",
      label: "RISK",
      width: "150px",
      sortBy: (r) => r.riskBand,
      render: (r) => <RiskTag band={r.riskBand} />,
    },
    {
      key: "taxBenefit",
      label: "TAX",
      width: "110px",
      render: (r) => <span className="h-mono text-[11.5px] text-[var(--color-ink-mid)]">{r.taxBenefit}</span>,
    },
    {
      key: "rationale",
      label: "REASON",
      render: (r) => (
        <span className="text-[12px] text-[var(--color-ink-mid)] line-clamp-1">{r.rationale}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="INSTRUMENT RECOMMENDATIONS"
        title="Concrete monthly allocations"
        subtitle="Specific instruments with rupee amounts, risk band, and rationale"
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {(Object.keys(categoryColor) as (keyof typeof categoryColor)[]).map((cat) => (
          <div key={cat} className="h-panel-raised px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: categoryColor[cat] }} />
              <span className="h-tick">{cat.toUpperCase()}</span>
            </div>
            <div className="h-mono text-2xl">{formatINR(totals[cat] ?? 0, { compact: true })}</div>
            <div className="h-tick text-[var(--color-ink-dim)]">PER MONTH</div>
          </div>
        ))}
      </section>

      <TerminalPanel title={`INSTRUMENTS · ${persona.instruments.length} POSITIONS`} subtitle="click any row to expand">
        <DataTable
          data={persona.instruments}
          columns={columns}
          searchableKeys={[(r) => r.name, (r) => r.subCategory, (r) => r.rationale]}
          expandable={(r) => (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[12.5px]">
              <div>
                <div className="h-tick mb-1">RATIONALE</div>
                <p className="text-[var(--color-ink-mid)] leading-snug">{r.rationale}</p>
              </div>
              <div>
                <div className="h-tick mb-1">TAX TREATMENT</div>
                <p className="text-[var(--color-ink-mid)] leading-snug">{r.taxBenefit}</p>
                <p className="text-[var(--color-ink-dim)] leading-snug mt-1 text-[11px]">
                  Holding period and slab rules apply per FY 2025-26 Indian taxation.
                </p>
              </div>
              <div>
                <div className="h-tick mb-1">FIT</div>
                <ul className="text-[var(--color-ink-mid)] leading-snug">
                  <li>Risk band · {r.riskBand}</li>
                  <li>Sub-category · {r.subCategory}</li>
                  <li>Monthly · {r.monthly === 0 ? "lump-sum / SWP" : formatINR(r.monthly)}</li>
                </ul>
              </div>
            </div>
          )}
        />
      </TerminalPanel>
    </>
  );
}
