"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { PageHeader } from "@/components/PageHeader";
import { formatINR } from "@/lib/format";

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    session,
    persona,
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
  } = useApp();
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState<"Self" | "Spouse" | "Parent" | "Child" | "Other">("Other");
  const [newIncome, setNewIncome] = useState(60000);
  const [newContribution, setNewContribution] = useState(12000);

  return (
    <>
      <PageHeader
        eyebrow="SETTINGS & PREFERENCES"
        title="Terminal configuration"
        subtitle={`Signed in as @${session?.username}`}
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalPanel title="APPEARANCE">
          <Row label="Theme" hint="Choose your preferred appearance.">
            <select
              className="h-mono w-full rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5 text-xs disabled:opacity-60"
              value={settings.theme}
              onChange={(e) =>
                updateSettings({ theme: e.target.value as "light" | "dark" })
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Row>
        </TerminalPanel>

        <TerminalPanel title="NOTIFICATIONS">
          {(["macro", "tax", "shortfall"] as const).map((k) => (
            <Toggle
              key={k}
              label={k === "macro" ? "Macro events" : k === "tax" ? "Tax optimization nudges" : "Shortfall alerts"}
              hint={
                k === "macro"
                  ? "Repo / inflation / crude trigger thresholds."
                  : k === "tax"
                  ? "80C / 80CCD / LTCG harvesting reminders."
                  : "Critical: any milestone projected below cost."
              }
              checked={settings.notifications[k]}
              onChange={(v) =>
                updateSettings({ notifications: { ...settings.notifications, [k]: v } })
              }
            />
          ))}
        </TerminalPanel>

        <TerminalPanel title="SAVINGS COACH">
          <Toggle
            label="Soft savings nudges"
            hint="Show spend transparency and weekly savings opportunities."
            checked={settings.savingsCoach.nudgesEnabled}
            onChange={(v) =>
              updateSettings({
                savingsCoach: { ...settings.savingsCoach, nudgesEnabled: v },
              })
            }
          />
          <Toggle
            label="Gamify savings"
            hint="Enable streaks, weekly challenge, and achievement badges."
            checked={settings.savingsCoach.gamificationEnabled}
            onChange={(v) =>
              updateSettings({
                savingsCoach: {
                  ...settings.savingsCoach,
                  gamificationEnabled: v,
                },
              })
            }
          />
          <Toggle
            label="Auto-escalate savings"
            hint="Suggest periodic savings increase to stay ahead of inflation."
            checked={settings.savingsCoach.autoEscalateEnabled}
            onChange={(v) =>
              updateSettings({
                savingsCoach: {
                  ...settings.savingsCoach,
                  autoEscalateEnabled: v,
                },
              })
            }
          />
          <Row label="Escalation %">
            <select
              className="h-mono w-full rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5 text-xs"
              value={settings.savingsCoach.autoEscalatePct}
              onChange={(e) =>
                updateSettings({
                  savingsCoach: {
                    ...settings.savingsCoach,
                    autoEscalatePct: Number(e.target.value),
                  },
                })
              }
            >
              {[3, 5, 7, 10].map((pct) => (
                <option key={pct} value={pct}>
                  {pct}%
                </option>
              ))}
            </select>
          </Row>
        </TerminalPanel>
        {persona.id === "family" && (
          <TerminalPanel title="FAMILY MEMBERS">
            <div className="text-[11px] text-[var(--color-ink-dim)] mb-3">
              Add household members and their monthly contribution to make family mode feel like a shared multi-user plan.
            </div>
            <div className="space-y-2.5">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-xl border border-[var(--color-edge)] bg-[var(--color-panel)] p-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        value={member.name}
                        onChange={(e) =>
                          updateFamilyMember(member.id, { name: e.target.value })
                        }
                        className="rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-2 py-1.5 text-xs"
                        placeholder="Name"
                      />
                      <select
                        value={member.relation}
                        onChange={(e) =>
                          updateFamilyMember(member.id, {
                            relation: e.target.value as "Self" | "Spouse" | "Parent" | "Child" | "Other",
                          })
                        }
                        className="rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-2 py-1.5 text-xs"
                      >
                        {["Self", "Spouse", "Parent", "Child", "Other"].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={member.monthlyIncome}
                        onChange={(e) =>
                          updateFamilyMember(member.id, {
                            monthlyIncome: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-2 py-1.5 text-xs"
                        placeholder="Monthly income"
                      />
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={member.monthlyContribution}
                        onChange={(e) =>
                          updateFamilyMember(member.id, {
                            monthlyContribution: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-2 py-1.5 text-xs"
                        placeholder="Monthly contribution"
                      />
                    </div>
                    <div className="flex md:flex-col items-end justify-between gap-2">
                      <div className="text-[10px] text-[var(--color-ink-dim)] text-right">
                        Income {formatINR(member.monthlyIncome, { compact: true })} · SIP{" "}
                        {formatINR(member.monthlyContribution, { compact: true })}
                      </div>
                      <button
                        onClick={() => removeFamilyMember(member.id)}
                        className="text-[11px] text-[var(--color-warn-dim)] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-dashed border-[var(--color-edge)] p-3">
              <div className="text-[11px] font-medium mb-2">Add member</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-2 py-1.5 text-xs"
                  placeholder="Name"
                />
                <select
                  value={newRelation}
                  onChange={(e) =>
                    setNewRelation(
                      e.target.value as "Self" | "Spouse" | "Parent" | "Child" | "Other"
                    )
                  }
                  className="rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-2 py-1.5 text-xs"
                >
                  {["Self", "Spouse", "Parent", "Child", "Other"].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={newIncome}
                  onChange={(e) => setNewIncome(Math.max(0, Number(e.target.value)))}
                  className="rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-2 py-1.5 text-xs"
                  placeholder="Monthly income"
                />
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={newContribution}
                  onChange={(e) => setNewContribution(Math.max(0, Number(e.target.value)))}
                  className="rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-2 py-1.5 text-xs"
                  placeholder="Monthly contribution"
                />
              </div>
              <button
                onClick={() => {
                  const name = newName.trim();
                  if (!name) return;
                  addFamilyMember({
                    name,
                    relation: newRelation,
                    monthlyIncome: newIncome,
                    monthlyContribution: newContribution,
                  });
                  setNewName("");
                  setNewIncome(60000);
                  setNewContribution(12000);
                }}
                className="mt-2 rounded-full bg-[var(--color-pill-dark)] px-3.5 py-1.5 text-[11px] font-medium text-white"
              >
                Add member
              </button>
            </div>
          </TerminalPanel>
        )}
      </section>
    </>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-start gap-3 py-2 border-b border-[var(--color-edge)] last:border-b-0">
      <div>
        <div className="text-[12.5px] font-medium">{label}</div>
        {hint && <div className="text-[11px] text-[var(--color-ink-dim)] mt-0.5">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-2 border-b border-[var(--color-edge)] last:border-b-0">
      <div>
        <div className="text-[12.5px] font-medium">{label}</div>
        {hint && <div className="text-[11px] text-[var(--color-ink-dim)] mt-0.5">{hint}</div>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-10 rounded-full border ${
          checked ? "bg-[var(--color-cyan-soft)] border-[var(--color-cyan-dim)]" : "bg-[var(--color-panel)] border-[var(--color-edge)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
            checked ? "left-5 bg-[var(--color-cyan)]" : "left-1 bg-[var(--color-ink-dim)]"
          }`}
        />
      </button>
    </div>
  );
}
