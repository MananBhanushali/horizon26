"use client";

import { ReactNode, useEffect } from "react";

export function DrawerPanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 460,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-3 top-3 bottom-3 max-w-full bg-[var(--color-panel)] rounded-3xl shadow-2xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-[110%]"
        }`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between gap-3 px-6 pt-6 pb-3">
          <div className="min-w-0">
            <div className="text-lg font-semibold tracking-tight">{title}</div>
            {subtitle && (
              <div className="text-xs text-[var(--color-ink-dim)] mt-1">{subtitle}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center h-8 w-8 rounded-full bg-[var(--color-grid)] text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </header>
        <div className="overflow-y-auto px-6 py-3 h-[calc(100%-140px)]">{children}</div>
        {footer && (
          <footer className="absolute bottom-0 left-0 right-0 border-t border-[var(--color-edge)] bg-[var(--color-panel)] px-6 py-4 rounded-b-3xl">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
