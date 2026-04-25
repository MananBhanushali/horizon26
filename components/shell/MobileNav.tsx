"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { label: "Home", href: "/dashboard", icon: "▦" },
  { label: "Timeline", href: "/timeline", icon: "↦" },
  { label: "Alloc.", href: "/allocation", icon: "◐" },
  { label: "Macro", href: "/macro", icon: "◌" },
  { label: "Alerts", href: "/alerts", icon: "!" },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[var(--color-edge)] bg-[var(--color-base)]/95 backdrop-blur-sm"
      aria-label="Mobile primary"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((i) => {
          const active = pathname === i.href;
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] ${
                  active ? "text-[var(--color-cyan)]" : "text-[var(--color-ink-mid)]"
                }`}
              >
                <span className="h-mono text-base">{i.icon}</span>
                <span>{i.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
