"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PRIMARY_NAV, SECONDARY_NAV } from "./navConfig";
import { useApp } from "@/components/providers/AppProvider";
import { useRouter } from "next/navigation";

const PROFILE_COLORS: Record<string, string> = {
  riya: "#a8d5ba",
  aditya: "#a3aef5",
  priya: "#e3b3d4",
  vikram: "#f5c89a",
  raj: "#b8e0d2",
  sharma: "#c8c8ff",
};

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const { session, persona, personaId, logout } = useApp();
  const router = useRouter();

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`absolute left-0 top-0 bottom-0 w-[290px] max-w-[85vw] bg-[var(--color-lavender-soft)] shadow-2xl transition-transform duration-200 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
      >
        {/* Header with profile + close */}
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="grid place-items-center h-10 w-10 rounded-full text-white text-sm font-semibold shrink-0"
              style={{ background: PROFILE_COLORS[personaId] ?? "#c8c8ff" }}
            >
              {persona.name.charAt(0)}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="text-sm font-semibold tracking-tight truncate">
                {persona.name}
              </div>
              <div className="text-[11px] text-[var(--color-ink-dim)] truncate">
                age {persona.age} · @{session?.username ?? "guest"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center h-9 w-9 rounded-full bg-white text-[var(--color-ink)]"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="flex flex-col gap-1.5">
            {PRIMARY_NAV.map((n) => {
              const active = isActive(pathname, search, n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--color-pill-dark)] text-white shadow-md"
                      : "text-[var(--color-ink)] hover:bg-white/60"
                  }`}
                >
                  <span className="grid place-items-center h-5 w-5">{n.icon}</span>
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/70">
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
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-[var(--color-pill-dark)] text-white"
                        : "text-[var(--color-ink-mid)] hover:bg-white/60 hover:text-[var(--color-ink)]"
                    }`}
                  >
                    <span className="grid place-items-center h-4 w-4">{n.icon}</span>
                    <span>{n.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 pt-3 pb-5 border-t border-white/70">
          <button
            onClick={() => {
              logout();
              onClose();
              router.push("/login");
            }}
            className="w-full rounded-full bg-white text-[var(--color-warn-dim)] text-sm font-medium py-2.5 hover:bg-white/80"
          >
            Sign out
          </button>
          <div className="mt-3 text-[10px] text-[var(--color-ink-dim)] leading-relaxed">
            Not financial advice. All numbers illustrative.
          </div>
        </div>
      </aside>
    </div>
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

  if (hrefQuery) {
    const need = new URLSearchParams(hrefQuery);
    for (const [k, v] of need.entries()) {
      if (search?.get(k) !== v) return false;
    }
    return true;
  }

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
    if (allMatch) return false;
  }
  return true;
}
