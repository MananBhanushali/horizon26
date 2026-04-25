"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";

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

  return (
    <div className="min-h-screen bg-[var(--color-base)] px-4 py-8">
      <div className="mx-auto w-full max-w-[390px] rounded-[42px] border-[10px] border-[#121212] bg-[#121212] p-1.5 shadow-[0_18px_48px_-18px_rgba(0,0,0,0.55)]">
        <div className="relative h-[760px] overflow-hidden rounded-[34px] bg-[var(--color-panel)]">
          <div className="absolute left-1/2 top-2 z-20 h-7 w-36 -translate-x-1/2 rounded-full bg-[#121212]" />
          <div className="h-full overflow-y-auto p-4 pt-12">
            <aside className="rounded-[24px] bg-[var(--color-lavender)] p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--color-pill-dark)] text-sm font-bold text-white">
                  H
                </div>
                <div>
                  <p className="h-tick">Horizon Bank</p>
                  <p className="text-sm font-medium text-[var(--color-ink-dim)]">
                    Secure Client Access
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-white/60 bg-white/65 p-4">
                <p className="h-tick">AVAILABLE BALANCE</p>
                <p className="mt-1.5 text-3xl font-semibold tracking-tight">
                  $8,405.00
                </p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {["Timeline", "Try changes", "Allocation", "Track"].map((action) => (
                    <div
                      key={action}
                      className="flex flex-col items-center gap-1.5 text-center"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-pill-dark)] text-xs text-white">
                        •
                      </span>
                      <span className="text-[10px] text-[var(--color-ink-dim)]">
                        {action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="mt-4 rounded-[24px] border border-[var(--color-edge)] bg-[var(--color-panel)] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                    Welcome back
                  </h1>
                  <p className="mt-1 text-xs text-[var(--color-ink-dim)]">
                    Log in to continue to your financial dashboard.
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full border border-white bg-[var(--color-lavender)]" />
              </div>

              <div className="mb-4 rounded-2xl border border-[var(--color-amber-dim)]/30 bg-[var(--color-amber-soft)] px-3 py-2 text-xs text-[var(--color-amber-dim)]">
                Demo-only access. Do not use real credentials.
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
                <Field label="Username">
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--color-edge)] bg-white px-3.5 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan-dim)] focus:outline-none"
                    placeholder="aditya"
                    aria-required
                  />
                </Field>
                <Field label="Password">
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--color-edge)] bg-white px-3.5 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan-dim)] focus:outline-none"
                    placeholder="demo123"
                    aria-required
                  />
                </Field>

                <label className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-ink-dim)] select-none">
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
                    className="rounded-2xl border border-[var(--color-warn-dim)]/35 bg-[var(--color-warn-soft)] px-3 py-2 text-xs text-[var(--color-warn-dim)]"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full rounded-full border border-[var(--color-pill-dark)] bg-[var(--color-pill-dark)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Authenticating..." : "Sign in"}
                </button>
              </form>
            </section>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center">
            <span className="h-1.5 w-28 rounded-full bg-[#121212]/80" />
          </div>
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
