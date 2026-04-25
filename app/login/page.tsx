"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { demoUsers } from "@/data/users";
import { TerminalPanel } from "@/components/ui/TerminalPanel";

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const r = login(username, password, remember);
      setLoading(false);
      if (!r.ok) {
        setError(r.error);
      } else {
        router.push("/dashboard");
      }
    }, 220);
  };

  const loadDemo = () => {
    setLoading(true);
    setTimeout(() => {
      const r = login("demo", "demo", true);
      setLoading(false);
      if (r.ok) router.push("/dashboard");
      else setError(r.error);
    }, 220);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 h-grid-bg opacity-30 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan/30 to-transparent" />

      <div className="relative grid place-items-center min-h-screen px-4 py-10">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-stretch">
          {/* Left: Terminal banner */}
          <div className="h-panel-raised h-scanline flex flex-col justify-between p-6 lg:p-8 min-h-[420px]">
            <div className="flex items-center gap-3">
              <div
                className="grid place-items-center h-9 w-9 rounded border border-[var(--color-cyan-dim)]/50 bg-[var(--color-base)] text-[var(--color-cyan)] h-mono text-lg font-bold"
                aria-hidden
              >
                H
              </div>
              <div className="leading-tight">
                <div className="h-mono text-base tracking-[0.06em]">
                  HORIZON TERMINAL
                </div>
                <div className="h-tick">PROJECT HORIZON · PS-09 · v1</div>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
                Plan the life you want.
                <br />
                <span className="text-[var(--color-cyan)]">
                  See if your money agrees.
                </span>
              </h1>
              <p className="mt-4 max-w-md text-sm text-[var(--color-ink-mid)] leading-relaxed">
                A financial planning terminal that simulates milestones,
                allocates with Black-Litterman, and shows you{" "}
                <em className="text-[var(--color-ink)]">why</em> — not just{" "}
                <em className="text-[var(--color-ink)]">what</em>.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-2 text-[12.5px] text-[var(--color-ink-mid)]">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />{" "}
                  Goal-based bucketing
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-mint)]" />{" "}
                  Bull / Base / Bear
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-amber)]" />{" "}
                  Macro-aware triggers
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-slate)]" />{" "}
                  Tax-adjusted returns
                </li>
              </ul>
            </div>

            <div className="mt-8 flex items-center justify-between text-[10.5px] text-[var(--color-ink-faint)] h-mono">
              <span>NOT FINANCIAL ADVICE</span>
              <span>{"//"} APR 2026 SNAPSHOT</span>
            </div>
          </div>

          {/* Right: Login card */}
          <TerminalPanel
            title="SESSION GATE"
            subtitle="Demo authentication — no real credentials required"
            raised
            scanline
          >
            <div className="mb-3 rounded border border-[var(--color-amber-dim)]/40 bg-[var(--color-amber-soft)] px-3 py-2 text-[11.5px] text-[var(--color-amber)]">
              ⚠ Demo auth only — credentials are visible in the bundle. Do{" "}
              <strong>not</strong> use real passwords.
            </div>

            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-3"
              noValidate
            >
              <Field label="USERNAME">
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-mono w-full rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-3 py-2 text-sm focus:border-[var(--color-cyan-dim)] focus:outline-none"
                  placeholder="aditya"
                  aria-required
                />
              </Field>
              <Field label="PASSWORD">
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-mono w-full rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-3 py-2 text-sm focus:border-[var(--color-cyan-dim)] focus:outline-none"
                  placeholder="demo123"
                  aria-required
                />
              </Field>
              <label className="flex items-center gap-2 text-xs text-[var(--color-ink-mid)] select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-[var(--color-cyan)]"
                />
                Remember me on this device
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded border border-[var(--color-warn-dim)]/40 bg-[var(--color-warn-soft)] px-3 py-2 text-xs text-[var(--color-warn)]"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded border border-[var(--color-cyan-dim)] bg-[var(--color-cyan-soft)] px-4 py-2.5 text-sm font-medium text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/15 disabled:opacity-60"
                >
                  {loading ? "AUTHENTICATING…" : "SIGN IN"}
                </button>
                <button
                  type="button"
                  onClick={loadDemo}
                  disabled={loading}
                  className="flex-1 rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-4 py-2.5 text-sm text-[var(--color-ink-mid)] hover:border-[var(--color-edge-strong)] hover:text-[var(--color-ink)]"
                >
                  Load demo persona
                </button>
              </div>
            </form>

            <div className="mt-5 border-t border-[var(--color-edge)] pt-4">
              <div className="h-tick mb-2">DEMO ACCOUNTS</div>
              <ul className="grid grid-cols-2 gap-1.5 text-[11px] h-mono">
                {demoUsers.map((u) => (
                  <li
                    key={u.username}
                    className="flex items-center justify-between gap-1.5 rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2 py-1.5"
                  >
                    <button
                      onClick={() => {
                        setUsername(u.username);
                        setPassword(u.password);
                        setError(null);
                      }}
                      className="text-left flex-1 hover:text-[var(--color-cyan)]"
                    >
                      <div>{u.username}</div>
                      <div className="text-[10px] text-[var(--color-ink-dim)]">
                        → {u.personaId}
                      </div>
                    </button>
                    <span className="text-[var(--color-ink-faint)]">
                      {u.password}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </TerminalPanel>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="h-tick">{label}</span>
      {children}
    </label>
  );
}
