"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PRIMARY_NAV, SECONDARY_NAV } from "./navConfig";

export function LeftRail() {
  const pathname = usePathname();
  const search = useSearchParams();

  return (
    <nav
      className="hidden lg:flex flex-col gap-2 bg-[var(--color-lavender-soft)] px-3 py-5 w-[220px] shrink-0 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto rounded-tr-[28px] rounded-br-[28px]"
      aria-label="Primary"
    >
      <div className="flex flex-col gap-1.5">
        {PRIMARY_NAV.map((n) => {
          const active = isActive(pathname, search, n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--color-pill-dark)] text-white shadow-md"
                  : "text-[var(--color-ink)] hover:bg-[var(--color-grid)]"
              }`}
            >
              <span className="grid place-items-center h-5 w-5">{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--color-edge)]">
        <div className="px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--color-ink-dim)]">
          Intelligence
        </div>
        <div className="flex flex-col gap-1">
          {SECONDARY_NAV.map((n) => {
            const active = isActive(pathname, search, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-full px-4 py-2 text-xs transition-colors ${
                  active
                    ? "bg-[var(--color-pill-dark)] text-white"
                    : "text-[var(--color-ink-mid)] hover:bg-[var(--color-grid)] hover:text-[var(--color-ink)]"
                }`}
              >
                <span className="grid place-items-center h-4 w-4">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto px-3 pt-3 text-[10px] text-[var(--color-ink-dim)] leading-relaxed">
        Not financial advice. All numbers illustrative.
      </div>
    </nav>
  );
}

function isActive(
  pathname: string | null,
  search: URLSearchParams | null,
  href: string
): boolean {
  if (!pathname) return false;
  const [hrefPath, hrefQuery] = href.split("?");
  if (pathname !== hrefPath) return false;

  // If the nav item targets a specific query (e.g. ?edit=money), only match
  // when the URL has those exact key=value pairs. This prevents Dashboard
  // (/dashboard) and My money (/dashboard?edit=money) from BOTH highlighting
  // when the user is on /dashboard.
  if (hrefQuery) {
    const need = new URLSearchParams(hrefQuery);
    for (const [k, v] of need.entries()) {
      if (search?.get(k) !== v) return false;
    }
    return true;
  }

  // Bare-path nav item: only match when no targeted query is present in the URL.
  // This means while ?edit=money is in the URL, the bare Dashboard item won't highlight.
  for (const item of [...PRIMARY_NAV, ...SECONDARY_NAV]) {
    const [otherPath, otherQuery] = item.href.split("?");
    if (otherPath !== hrefPath || !otherQuery) continue;
    const otherNeed = new URLSearchParams(otherQuery);
    let allMatch = true;
    for (const [k, v] of otherNeed.entries()) {
      if (search?.get(k) !== v) {
        allMatch = false;
        break;
      }
    }
    if (allMatch) return false; // a sibling-with-query wins
  }
  return true;
}
