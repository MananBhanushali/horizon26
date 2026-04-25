"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";

type Command = {
  id: string;
  label: string;
  hint: string;
  group: "Navigate" | "Actions";
  action: () => void;
  keywords?: string[];
};

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { logout } = useApp();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      if (cmdKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const commands: Command[] = useMemo(
    () => [
      { id: "nav-home", label: "Dashboard", hint: "Home", group: "Navigate", action: () => router.push("/dashboard") },
      { id: "nav-investments", label: "My Investments", hint: "/investments", group: "Navigate", action: () => router.push("/investments") },
      { id: "nav-timeline", label: "Timeline & Milestones", hint: "/timeline", group: "Navigate", action: () => router.push("/timeline") },
      { id: "nav-allocation", label: "Allocation Intelligence", hint: "/allocation", group: "Navigate", action: () => router.push("/allocation") },
      { id: "nav-bl", label: "Black-Litterman Explainability", hint: "/black-litterman", group: "Navigate", action: () => router.push("/black-litterman") },
      { id: "nav-macro", label: "Macro Context & Triggers", hint: "/macro", group: "Navigate", action: () => router.push("/macro") },
      { id: "nav-tax", label: "Tax Impact", hint: "/tax", group: "Navigate", action: () => router.push("/tax") },
      { id: "nav-instruments", label: "Instrument Recommendations", hint: "/instruments", group: "Navigate", action: () => router.push("/instruments") },
      { id: "nav-scenarios", label: "Scenario Comparison", hint: "/scenarios", group: "Navigate", action: () => router.push("/scenarios") },
      { id: "nav-whatif", label: "What-if Sandbox", hint: "/sandbox", group: "Navigate", action: () => router.push("/sandbox") },
      { id: "nav-alerts", label: "Notifications & Alerts", hint: "/alerts", group: "Navigate", action: () => router.push("/alerts") },
      { id: "nav-settings", label: "Settings", hint: "/settings", group: "Navigate", action: () => router.push("/settings") },
      { id: "act-logout", label: "Logout", hint: "Clear session", group: "Actions", action: () => { logout(); router.push("/login"); } },
    ],
    [router, logout]
  );

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q) ||
        c.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }, [commands, query]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  if (!open) return null;

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, c) => {
    (acc[c.group] ??= []).push(c);
    return acc;
  }, {});

  let runningIdx = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="h-panel-raised w-full max-w-xl overflow-hidden h-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-2 border-b border-[var(--color-edge)] px-3 py-2">
          <span className="h-mono text-[var(--color-cyan)] text-xs">›</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(c + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const cmd = filtered[cursor];
                if (cmd) {
                  cmd.action();
                  setOpen(false);
                }
              }
            }}
            placeholder="Type a command…  (Esc to close)"
            className="h-mono w-full bg-transparent text-sm placeholder:text-[var(--color-ink-faint)] focus:outline-none"
          />
          <span className="h-tick">⌘ K</span>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-1">
          {Object.entries(grouped).map(([g, items]) => (
            <div key={g}>
              <div className="h-tick px-3 py-1.5">{g}</div>
              {items.map((c) => {
                const idx = runningIdx++;
                const active = idx === cursor;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      c.action();
                      setOpen(false);
                    }}
                    onMouseEnter={() => setCursor(idx)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm ${
                      active ? "bg-[var(--color-cyan-soft)] text-[var(--color-ink)]" : "text-[var(--color-ink-mid)] hover:bg-[var(--color-raised)]"
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="h-tick">{c.hint}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-[var(--color-ink-dim)]">No commands match.</div>
          )}
        </div>
      </div>
    </div>
  );
}
