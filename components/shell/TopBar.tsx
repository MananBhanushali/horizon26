"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { demoUsers } from "@/data/users";
import { personaById } from "@/data/personas";
import { useRouter } from "next/navigation";
import { LogoHorizontal } from "@/components/ui/Logo";

const PROFILE_COLORS: Record<string, string> = {
  riya: "#a8d5ba",
  aditya: "#a3aef5",
  priya: "#e3b3d4",
  vikram: "#f5c89a",
  raj: "#b8e0d2",
  sharma: "#c8c8ff",
};

export function TopBar() {
  const { session, persona, personaId, switchUser, logout } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Click outside closes the menu
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-base)]/85 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 lg:flex-nowrap">
        {/* Brand */}
        <div className="flex items-center shrink-0 w-[200px]">
          <LogoHorizontal className="-ml-1" />
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Search */}
          <button
            className="hidden md:flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-sm text-[var(--color-ink-dim)] hover:bg-white/90 min-w-[260px]"
            onClick={() => {
              const ev = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                ctrlKey: true,
              });
              window.dispatchEvent(ev);
            }}
          >
            <SearchIcon />
            <span className="flex-1 text-left">Search anywhere</span>
            <span className="text-[10px] text-[var(--color-ink-faint)]">⌘K</span>
          </button>

          {/* Notifications */}
          <button
            className="relative grid place-items-center h-10 w-10 rounded-full bg-white text-[var(--color-ink)] hover:bg-white/90"
            aria-label="Notifications"
            onClick={() => router.push("/alerts")}
          >
            <BellIcon />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[var(--color-warn)]" />
          </button>

          {/* Profile dropdown */}
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-white pl-1 pr-3 py-1 hover:bg-white/90"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <span
                className="grid place-items-center h-9 w-9 rounded-full text-white text-sm font-semibold"
                style={{ background: PROFILE_COLORS[personaId] ?? "#c8c8ff" }}
              >
                {persona.name.charAt(0)}
              </span>
              <div className="text-left leading-tight pr-1">
                <div className="text-sm font-semibold">{persona.name}</div>
                <div className="text-[10px] text-[var(--color-ink-dim)]">
                  Sample profile · age {persona.age}
                </div>
              </div>
              <ChevronDown />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-[300px] rounded-2xl bg-white shadow-xl border border-[var(--color-edge)] p-2 z-40">
                <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-dim)]">
                  Switch user
                </div>
                <ul className="max-h-[240px] overflow-auto">
                  {demoUsers.map((u) => {
                    const active = u.username === session?.username;
                    const linkedPersona = personaById(u.personaId);
                    return (
                      <li key={u.username}>
                        <button
                          onClick={() => {
                            if (!active) switchUser(u.username);
                            setOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left ${
                            active ? "bg-[var(--color-lavender-soft)]" : "hover:bg-[var(--color-grid)]"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">@{u.username}</div>
                            <div className="text-[11px] text-[var(--color-ink-dim)] truncate">
                              {linkedPersona.name} · {linkedPersona.title}
                            </div>
                          </div>
                          {active && <span className="text-[var(--color-cyan-dim)] text-xs">●</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-1 pt-2 border-t border-[var(--color-edge)] flex items-center justify-between px-3 py-1">
                  <span className="text-[11px] text-[var(--color-ink-dim)]">
                    Signed in as @{session?.username}
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                    className="text-[11px] text-[var(--color-warn-dim)] hover:underline"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
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
function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
