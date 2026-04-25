"use client";

import { useApp } from "@/components/providers/AppProvider";
import { personas } from "@/data/personas";
import { useRouter } from "next/navigation";

export function TopBar() {
  const { session, persona, personaId, setPersonaId, logout } = useApp();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-base)]/85 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 lg:flex-nowrap">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0 w-[200px]">
          <div
            className="grid place-items-center h-9 w-9 rounded-xl bg-[var(--color-pill-dark)] text-white font-bold"
            aria-hidden
          >
            H
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Horizon</div>
            <div className="text-[10px] text-[var(--color-ink-dim)]">Banking · v1</div>
          </div>
        </div>

        {/* Persona switcher pills */}
        <nav className="hidden md:flex flex-wrap gap-1.5 lg:flex-nowrap" aria-label="Personas">
          {personas.map((p) => {
            const active = personaId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPersonaId(p.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-pill-dark)] text-white"
                    : "bg-white text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]"
                }`}
                title={p.title}
              >
                {p.name.split(" ")[0]}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Search */}
          <button
            className="hidden md:flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-sm text-[var(--color-ink-dim)] hover:bg-white/90 min-w-[260px]"
            onClick={() => {
              const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true });
              window.dispatchEvent(ev);
            }}
          >
            <SearchIcon />
            <span className="flex-1 text-left">Search something</span>
            <span className="text-[10px] text-[var(--color-ink-faint)]">⌘K</span>
          </button>

          {/* Notification bell */}
          <button
            className="relative grid place-items-center h-10 w-10 rounded-full bg-white text-[var(--color-ink)] hover:bg-white/90"
            aria-label="Notifications"
          >
            <BellIcon />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[var(--color-warn)]" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 pl-1">
            <div className="grid place-items-center h-10 w-10 rounded-full bg-[var(--color-lavender-deep)] text-[var(--color-ink)] text-sm font-semibold ring-2 ring-white">
              {session?.username.charAt(0).toUpperCase() ?? "?"}
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="hidden lg:block text-[11px] text-[var(--color-ink-dim)] hover:text-[var(--color-warn)]"
              aria-label="Logout"
              title={`Logout · ${persona.title}`}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 0 1 12 0v4l1.5 3h-15L6 13Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}
