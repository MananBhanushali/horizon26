"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { label: string; href: string; icon: string; group: string }[] = [
  { label: "Dashboard", href: "/dashboard", icon: "▦", group: "Overview" },
  { label: "Timeline", href: "/timeline", icon: "↦", group: "Overview" },
  { label: "Allocation", href: "/allocation", icon: "◐", group: "Intelligence" },
  { label: "Black-Litterman", href: "/black-litterman", icon: "✦", group: "Intelligence" },
  { label: "Macro", href: "/macro", icon: "◌", group: "Intelligence" },
  { label: "Tax Impact", href: "/tax", icon: "₹", group: "Decisions" },
  { label: "Instruments", href: "/instruments", icon: "≡", group: "Decisions" },
  { label: "Scenarios", href: "/scenarios", icon: "△", group: "Decisions" },
  { label: "What-if", href: "/sandbox", icon: "↻", group: "Decisions" },
  { label: "Alerts", href: "/alerts", icon: "!", group: "System" },
  { label: "Settings", href: "/settings", icon: "⚙", group: "System" },
];

export function LeftRail() {
  const pathname = usePathname();
  const groups = NAV.reduce<Record<string, typeof NAV>>((acc, n) => {
    (acc[n.group] ??= []).push(n);
    return acc;
  }, {});

  return (
    <nav
      className="hidden lg:flex flex-col gap-3 border-r border-[var(--color-edge)] bg-[var(--color-base)] px-2 py-3 w-[180px] shrink-0 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto"
      aria-label="Primary"
    >
      {Object.entries(groups).map(([g, items]) => (
        <div key={g} className="flex flex-col gap-0.5">
          <div className="h-tick px-2 pb-1">{g}</div>
          {items.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
                  active
                    ? "bg-[var(--color-cyan-soft)] text-[var(--color-cyan)] border border-[var(--color-cyan-dim)]/40"
                    : "border border-transparent text-[var(--color-ink-mid)] hover:bg-[var(--color-raised)] hover:text-[var(--color-ink)]"
                }`}
              >
                <span className="h-mono w-4 text-center text-[var(--color-ink-dim)]">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
      <div className="mt-auto px-2 pt-3 text-[10px] text-[var(--color-ink-faint)] leading-relaxed">
        Not financial advice. All numbers illustrative.
      </div>
    </nav>
  );
}
