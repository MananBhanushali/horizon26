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
        className={`absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full max-w-full bg-[var(--color-panel)] border-l border-[var(--color-edge)] shadow-2xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between gap-3 border-b border-[var(--color-edge)] px-5 py-3">
          <div>
            <div className="h-tick">{typeof title === "string" ? title : null}</div>
            <div className="text-base font-medium tracking-tight">
              {typeof title !== "string" && title}
            </div>
            {subtitle && <div className="text-xs text-[var(--color-ink-dim)] mt-0.5">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="h-mono text-[var(--color-ink-mid)] hover:text-[var(--color-cyan)] text-xs px-2 py-1 rounded border border-[var(--color-edge)]"
            aria-label="Close drawer"
          >
            ESC ✕
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-4 h-[calc(100%-128px)]">{children}</div>
        {footer && (
          <footer className="absolute bottom-0 left-0 right-0 border-t border-[var(--color-edge)] bg-[var(--color-panel)] px-5 py-3">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
