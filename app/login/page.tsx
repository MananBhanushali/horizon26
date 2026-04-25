"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useApp } from "@/components/providers/AppProvider";
import { Logo } from "@/components/ui/Logo";
import MagnetLines from "@/components/ui/MagnetLines";
import FinanceDecorations from "@/components/ui/FinanceDecorations";

// FinanceScene uses WebGL/Three.js — render client-only.
const FinanceScene = dynamic(() => import("@/components/ui/FinanceScene"), {
  ssr: false,
});

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
    <div
      className="min-h-screen bg-[var(--color-base)] flex items-center justify-center p-4"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Background MagnetLines effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.18,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <MagnetLines
          rows={16}
          columns={16}
          containerSize="100vw"
          lineColor="var(--color-cyan, #06b6d4)"
          lineWidth="0.6vmin"
          lineHeight="4.5vmin"
          baseAngle={0}
          style={{ pointerEvents: "auto", width: "100vw", height: "100vh" }}
        />
      </div>

      {/* Scattered finance SVG decorations */}
      <FinanceDecorations />

      {/* Interactive 3D finance scene (Three.js) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        <FinanceScene />
      </div>

      <div className="w-full max-w-md rounded-[24px] border border-[var(--color-edge)] bg-[var(--color-panel)] p-8 shadow-sm" style={{ position: "relative", zIndex: 5 }}>
        <div className="mb-8 text-center">
          <Logo className="mb-6 scale-90" />
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-dim)]">
            Log in to continue to your financial dashboard.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-[var(--color-amber-dim)]/30 bg-[var(--color-amber-soft)] px-4 py-3 text-sm text-[var(--color-amber-dim)]">
          Demo-only access. Do not use real credentials.
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Field label="Username">
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-edge)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan-dim)] focus:outline-none"
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
              className="w-full rounded-2xl border border-[var(--color-edge)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan-dim)] focus:outline-none"
              placeholder="demo123"
              aria-required
            />
          </Field>

          <label className="mt-1 flex items-center gap-2 text-sm text-[var(--color-ink-dim)] select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-[var(--color-cyan)] h-4 w-4 rounded"
            />
            Remember me on this device
          </label>

          {error && (
            <div
              role="alert"
              className="mt-2 rounded-2xl border border-[var(--color-warn-dim)]/35 bg-[var(--color-warn-soft)] px-4 py-3 text-sm text-[var(--color-warn-dim)]"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-full border border-[var(--color-pill-dark)] bg-[var(--color-pill-dark)] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Authenticating..." : "Sign in"}
          </button>
        </form>
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
