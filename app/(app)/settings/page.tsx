"use client";

import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/ToastAlert";
import { personas } from "@/data/personas";

export default function SettingsPage() {
  const { settings, updateSettings, session, logout } = useApp();
  const toast = useToast();

  return (
    <>
      <PageHeader
        eyebrow="SETTINGS & PREFERENCES"
        title="Terminal configuration"
        subtitle={`Signed in as @${session?.username}`}
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalPanel title="APPEARANCE">
          <Row label="Theme" hint="Dark default; light mode is a P2 stretch.">
            <select
              disabled
              className="h-mono w-full rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5 text-xs disabled:opacity-60"
              defaultValue="dark"
            >
              <option value="dark">Dark (default)</option>
              <option value="light">Light (coming soon)</option>
            </select>
          </Row>
          <Row label="Number formatting" hint="Affects rupee grouping and lakh/crore notation.">
            <select
              value={settings.numberFormat}
              onChange={(e) => {
                updateSettings({ numberFormat: e.target.value as "indian" | "international" });
                toast.push({ title: "Saved", body: "Number formatting updated.", severity: "success" });
              }}
              className="h-mono w-full rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5 text-xs"
            >
              <option value="indian">Indian (Rs. 12,50,000)</option>
              <option value="international">International ($1,250,000)</option>
            </select>
          </Row>
        </TerminalPanel>

        <TerminalPanel title="DEFAULT PERSONA">
          <Row label="On login, land on" hint="Override the user's bound persona.">
            <select
              value={settings.defaultPersona ?? ""}
              onChange={(e) => {
                const v = e.target.value || null;
                updateSettings({ defaultPersona: (v as never) || null });
                toast.push({ title: "Saved", body: "Default persona updated.", severity: "success" });
              }}
              className="h-mono w-full rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5 text-xs"
            >
              <option value="">— bound to user account —</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
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

        <TerminalPanel title="SESSION">
          <Row label="Username" hint="Demo auth — no PII stored.">
            <input readOnly value={session?.username ?? ""} className="h-mono w-full rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5 text-xs" />
          </Row>
          <button
            onClick={() => {
              logout();
              toast.push({ title: "Signed out", severity: "info" });
            }}
            className="mt-3 h-mono text-xs rounded border border-[var(--color-warn-dim)]/50 bg-[var(--color-warn-soft)] px-3 py-1.5 text-[var(--color-warn)]"
          >
            CLEAR SESSION
          </button>
          <p className="mt-3 text-[11.5px] text-[var(--color-ink-dim)] leading-snug">
            All data is local-only. No telemetry. Demo credentials live in <span className="h-mono">data/users.ts</span>.
          </p>
        </TerminalPanel>
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
