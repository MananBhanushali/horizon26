"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { demoUsers } from "@/data/users";
import { personas } from "@/data/personas";

const PROFILE_COLORS: Record<string, string> = {
  riya: "#a8d5ba",
  aditya: "#a3aef5",
  priya: "#e3b3d4",
  vikram: "#f5c89a",
  raj: "#b8e0d2",
  sharma: "#c8c8ff",
};

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const signInAs = (u: string, p: string) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const r = login(u, p, true);
      setLoading(false);
      if (r.ok) router.push("/dashboard");
      else setError(r.error);
    }, 200);
  };

  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }
    signInAs(username, password);
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Top brand bar */}
      <header className="px-6 py-5 flex items-center gap-3">
        <div
          className="grid place-items-center h-10 w-10 rounded-2xl bg-[var(--color-pill-dark)] text-white font-bold"
          aria-hidden
        >
          H
        </div>
        <div className="leading-tight">
          <div className="text-base font-semibold tracking-tight">Horizon</div>
          <div className="text-[11px] text-[var(--color-ink-dim)]">
            Plan goals · See your money agree
          </div>
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-4 pb-10">
        <div className="w-full max-w-5xl">
          {/* Hero */}
          <div className="text-center mb-7">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              See if your savings can hit your life goals
            </h1>
            <p className="mt-3 text-sm md:text-base text-[var(--color-ink-mid)] max-w-2xl mx-auto leading-relaxed">
              Drag goals onto a timeline and watch the math run. Buying a house at 32 drains the
              corpus that was funding a business at 35 — Horizon shows you the cascade, not
              calculator-by-calculator.
            </p>
          </div>

          {/* Profile cards — one-click sign-in */}
          <div className="rounded-3xl bg-white p-6 md:p-7 shadow-sm border border-[var(--color-edge)]">
            <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
              <div>
                <div className="text-base font-semibold tracking-tight">
                  Continue as a sample profile
                </div>
                <div className="text-xs text-[var(--color-ink-dim)] mt-0.5">
                  Six pre-built financial situations. Pick one to explore — no signup, all data is
                  illustrative.
                </div>
              </div>
              <button
                onClick={() => setShowManual((v) => !v)}
                className="text-xs text-[var(--color-cyan-dim)] hover:underline"
              >
                {showManual ? "Hide" : "Use a username instead"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {personas.map((p) => {
                const user = demoUsers.find((u) => u.personaId === p.id);
                if (!user) return null;
                const onTrack = p.status === "ON_TRACK" || p.status === "SURPLUS";
                return (
                  <button
                    key={p.id}
                    onClick={() => signInAs(user.username, user.password)}
                    disabled={loading}
                    className="group text-left rounded-2xl border border-[var(--color-edge)] bg-[var(--color-grid)] hover:bg-white hover:border-[var(--color-lavender-deep)] hover:shadow-md transition-all p-4 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid place-items-center h-12 w-12 rounded-full text-white text-base font-semibold"
                        style={{ background: PROFILE_COLORS[p.id] ?? "#c8c8ff" }}
                      >
                        {p.name.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold tracking-tight">
                          {p.name}, {p.age}
                        </div>
                        <div className="text-[11px] text-[var(--color-ink-dim)] truncate">
                          {p.title.replace(`${p.name} the `, "")}
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          color: onTrack ? "var(--color-mint-dim)" : "var(--color-warn-dim)",
                          background: onTrack
                            ? "var(--color-mint-soft)"
                            : "var(--color-warn-soft)",
                        }}
                      >
                        {p.headlineStatus}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-[var(--color-ink-mid)] leading-snug">
                      {p.tagline}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-lg bg-white/70 px-2 py-1">
                        <div className="text-[10px] text-[var(--color-ink-dim)]">Net worth</div>
                        <div className="font-semibold tabular-nums">
                          ₹{compactDigits(p.netWorth)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/70 px-2 py-1">
                        <div className="text-[10px] text-[var(--color-ink-dim)]">
                          {p.monthlyContribution >= 0 ? "Monthly SIP" : "Monthly draw"}
                        </div>
                        <div className="font-semibold tabular-nums">
                          ₹{compactDigits(Math.abs(p.monthlyContribution))}
                          <span className="text-[10px] text-[var(--color-ink-dim)] ml-0.5">
                            /mo
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Manual login (collapsible) */}
            {showManual && (
              <form
                onSubmit={onManualSubmit}
                className="mt-6 pt-5 border-t border-[var(--color-edge)] grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] items-end gap-3"
              >
                <Field label="Username">
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="aditya"
                    className="w-full rounded-xl border border-[var(--color-edge)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-cyan)] focus:outline-none"
                  />
                </Field>
                <Field label="Password">
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="demo123"
                    className="w-full rounded-xl border border-[var(--color-edge)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-cyan)] focus:outline-none"
                  />
                </Field>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-[var(--color-pill-dark)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
            )}

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl px-3 py-2 text-xs"
                style={{ background: "var(--color-warn-soft)", color: "var(--color-warn-dim)" }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between text-[11px] text-[var(--color-ink-dim)] flex-wrap gap-2 px-2">
            <span>Demo data only · not financial advice · all numbers illustrative</span>
            <span>Apr 2026 macro snapshot</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-ink-dim)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function compactDigits(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_00_00_000)
    return `${(abs / 1_00_00_000).toFixed(abs >= 10_00_00_000 ? 1 : 2)} Cr`;
  if (abs >= 1_00_000) return `${(abs / 1_00_000).toFixed(abs >= 10_00_000 ? 1 : 2)} L`;
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(0)}K`;
  return abs.toLocaleString("en-IN");
}
