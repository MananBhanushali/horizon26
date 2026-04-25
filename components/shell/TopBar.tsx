"use client";

import { useApp } from "@/components/providers/AppProvider";
import { personas } from "@/data/personas";
import { PersonaPill } from "@/components/ui/PersonaPill";
import { useRouter } from "next/navigation";

export function TopBar() {
  const { session, persona, personaId, setPersonaId, logout } = useApp();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-edge)] bg-[var(--color-base)]/95 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 lg:flex-nowrap">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="grid place-items-center h-8 w-8 rounded border border-[var(--color-cyan-dim)]/50 bg-[var(--color-base)] text-[var(--color-cyan)] h-mono font-bold"
            aria-hidden
          >
            H
          </div>
          <div className="leading-tight">
            <div className="h-mono text-sm tracking-[0.06em]">HORIZON</div>
            <div className="h-tick">PROJECT HORIZON · v1</div>
          </div>
        </div>

        <div className="hidden lg:block h-7 w-px bg-[var(--color-edge)]" />

        {/* Persona pills */}
        <nav className="flex flex-wrap gap-1.5 lg:flex-nowrap" aria-label="Personas">
          {personas.map((p) => (
            <PersonaPill
              key={p.id}
              persona={p}
              active={personaId === p.id}
              onClick={() => setPersonaId(p.id)}
            />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Search / command */}
          <button
            className="hidden md:flex items-center gap-2 rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5 text-xs text-[var(--color-ink-dim)] hover:border-[var(--color-edge-strong)]"
            onClick={() => {
              const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true });
              window.dispatchEvent(ev);
            }}
          >
            <span>Search anything…</span>
            <span className="h-tick">⌘K</span>
          </button>

          {/* Live tag */}
          <div className="hidden md:flex items-center gap-1.5 rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2 py-1 text-[10px] text-[var(--color-ink-mid)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-mint)] h-pulse" aria-hidden />
            <span className="h-mono">FIXTURES · APR 2026</span>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2 rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2 py-1">
            <div className="grid place-items-center h-6 w-6 rounded-full border border-[var(--color-edge-strong)] bg-[var(--color-base)] text-[10px] h-mono">
              {session?.username.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="text-xs leading-tight">
              <div className="text-[var(--color-ink)]">@{session?.username}</div>
              <div className="h-tick">{persona.title}</div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="ml-1 h-mono text-[11px] text-[var(--color-ink-mid)] hover:text-[var(--color-warn)]"
              aria-label="Logout"
              title="Logout"
            >
              ⏻
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
