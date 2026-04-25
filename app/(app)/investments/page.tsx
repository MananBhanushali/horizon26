"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp, type UserInvestment } from "@/components/providers/AppProvider";
import { formatINR } from "@/lib/format";

const compact = (n: number) => formatINR(n, { compact: true }).replace("Rs. ", "");

export default function InvestmentsPage() {
  const {
    persona,
    investments,
    updateInvestments,
    resetInvestments,
    livePlan,
    finances,
  } = useApp();
  const [draft, setDraft] = useState<UserInvestment[]>(investments);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setDraft(investments);
  }, [investments]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(investments),
    [draft, investments]
  );

  const totalValue = draft.reduce((acc, inv) => acc + Math.max(0, inv.currentValue), 0);
  const weightedReturn =
    totalValue > 0
      ? draft.reduce((acc, inv) => acc + Math.max(0, inv.currentValue) * inv.annualReturn, 0) /
        totalValue
      : livePlan.effectiveAnnualReturn;

  const fundedGoals = livePlan.milestones.filter(
    (m) => m.statusLive === "ON_TRACK" || m.statusLive === "SURPLUS"
  ).length;
  const yearsToRetirementGoal = Math.max(0, persona.retirementAge - persona.age);

  const addInvestment = (next: Omit<UserInvestment, "id">) => {
    const id = `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setDraft((arr) => [...arr, { id, ...next }]);
    setShowAddForm(false);
  };

  const removeInvestment = (id: string) => {
    setDraft((arr) => arr.filter((inv) => inv.id !== id));
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl bg-[var(--color-panel)] border border-[var(--color-edge)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <div className="text-base md:text-lg font-semibold tracking-tight">My investments</div>
            <div className="text-xs text-[var(--color-ink-dim)] mt-0.5">
              Track current value and expected return across all suggested assets.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="rounded-full bg-[var(--color-grid)] px-4 py-2 text-xs font-medium text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]"
            >
              + Add investment
            </button>
            <button
              onClick={() => {
                resetInvestments();
              }}
              className="text-[11px] text-[var(--color-ink-mid)] hover:text-[var(--color-ink)] underline-offset-2 hover:underline"
            >
              Reset to suggested
            </button>
            <button
              onClick={() => updateInvestments(draft)}
              disabled={!dirty}
              className="rounded-full bg-[var(--color-pill-dark)] text-white px-5 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save investments
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Tile label="Tracked assets" value={`${draft.length}`} sub="suggested instruments" />
          <Tile label="Current invested" value={`₹${compact(totalValue)}`} sub="across all assets" />
          <Tile
            label="Weighted return"
            value={`${weightedReturn.toFixed(2)}%`}
            sub={`used in timeline instead of ${persona.preTaxReturn.toFixed(1)}%`}
          />
          <Tile
            label="Goals funded"
            value={`${fundedGoals}/${livePlan.milestones.length}`}
            sub={`retirement in ${yearsToRetirementGoal} years`}
          />
        </div>
      </section>

      <section className="rounded-3xl bg-[var(--color-panel)] border border-[var(--color-edge)] p-6 shadow-sm">
        <div className="text-sm font-semibold mb-3">Suggested assets you can track</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[var(--color-ink-dim)] border-b border-[var(--color-edge)]">
                <th className="pb-2 pr-3">Asset</th>
                <th className="pb-2 pr-3">Category</th>
                <th className="pb-2 pr-3">Suggested monthly</th>
                <th className="pb-2 pr-3">Current value</th>
                <th className="pb-2 pr-3">Expected annual return</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {draft.map((inv) => (
                <tr key={inv.id} className="border-b border-[var(--color-edge)] last:border-0">
                  <td className="py-3 pr-3">
                    <div className="font-medium">{inv.name}</div>
                  </td>
                  <td className="py-3 pr-3 text-[var(--color-ink-mid)]">{inv.category}</td>
                  <td className="py-3 pr-3">₹{compact(Math.max(0, inv.monthly))}/mo</td>
                  <td className="py-3 pr-3">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={inv.currentValue}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setDraft((list) =>
                          list.map((x) =>
                            x.id === inv.id ? { ...x, currentValue: Number.isFinite(next) ? next : 0 } : x
                          )
                        );
                      }}
                      className="w-40 rounded-xl border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-cyan)] focus:outline-none"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={25}
                        step={0.1}
                        value={inv.annualReturn}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          setDraft((list) =>
                            list.map((x) =>
                              x.id === inv.id ? { ...x, annualReturn: Number.isFinite(next) ? next : 0 } : x
                            )
                          );
                        }}
                        className="w-28 rounded-xl border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-cyan)] focus:outline-none"
                      />
                      <span className="text-[var(--color-ink-dim)]">%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => removeInvestment(inv.id)}
                      className="text-xs text-[var(--color-warn-dim)] hover:underline underline-offset-2"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--color-ink-dim)] leading-relaxed">
          Changes here immediately impact your goal projection baseline after saving. The timeline
          uses this weighted return to estimate corpus growth and years to goal.
        </p>
      </section>

      <section className="rounded-3xl bg-[var(--color-lavender-soft)] p-5 text-sm text-[var(--color-ink-mid)]">
        Monthly savings currently feeding investments:{" "}
        <span className="font-semibold text-[var(--color-ink)]">
          ₹{compact(Math.max(0, finances.monthlySavings))}/month
        </span>
        . Update &quot;My money&quot; to change how much gets deployed each month.
      </section>

      {showAddForm && (
        <AddInvestmentDialog
          onClose={() => setShowAddForm(false)}
          onAdd={addInvestment}
        />
      )}
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-[var(--color-grid)] p-4">
      <div className="text-xs font-medium text-[var(--color-ink-mid)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="text-[11px] text-[var(--color-ink-dim)] mt-1">{sub}</div>
    </div>
  );
}

function AddInvestmentDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: Omit<UserInvestment, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<UserInvestment["category"]>("Equity");
  const [monthly, setMonthly] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [annualReturn, setAnnualReturn] = useState(11);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-[var(--color-panel)] border border-[var(--color-edge)] p-6 shadow-xl">
        <div className="text-lg font-semibold tracking-tight">Add an investment</div>
        <div className="text-xs text-[var(--color-ink-dim)] mt-1 leading-relaxed">
          Track a new asset and include it in your weighted return used by timeline projections.
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <Field label="Investment name">
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nifty 50 Index Fund"
              className="w-full rounded-xl border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-cyan)] focus:outline-none"
            />
          </Field>

          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as UserInvestment["category"])}
              className="w-full rounded-xl border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
            >
              {(["Equity", "Debt", "Gold", "Liquid"] as const).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Monthly contribution">
            <input
              type="number"
              value={monthly}
              min={0}
              step={500}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
            />
          </Field>

          <Field label="Current value">
            <input
              type="number"
              value={currentValue}
              min={0}
              step={1000}
              onChange={(e) => setCurrentValue(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
            />
          </Field>

          <Field label="Expected annual return (%)">
            <input
              type="number"
              value={annualReturn}
              min={0}
              max={25}
              step={0.1}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
            />
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full bg-[var(--color-grid)] px-4 py-2 text-xs font-medium text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]"
          >
            Cancel
          </button>
          <button
            disabled={!name.trim() || currentValue < 0 || annualReturn < 0}
            onClick={() =>
              onAdd({
                name: name.trim(),
                category,
                monthly: Number.isFinite(monthly) ? Math.max(0, monthly) : 0,
                currentValue: Number.isFinite(currentValue) ? Math.max(0, currentValue) : 0,
                annualReturn: Number.isFinite(annualReturn) ? Math.max(0, annualReturn) : 0,
              })
            }
            className="rounded-full bg-[var(--color-pill-dark)] px-5 py-2 text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add investment
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-dim)]">
        {label}
      </span>
      {children}
    </label>
  );
}
