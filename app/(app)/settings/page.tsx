"use client";

import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { PageHeader } from "@/components/PageHeader";

export default function SettingsPage() {
  const { settings, updateSettings, session } = useApp();

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
