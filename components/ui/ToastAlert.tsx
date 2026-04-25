"use client";

import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";

export type Toast = {
  id: string;
  title: string;
  body?: string;
  severity?: "info" | "warning" | "critical" | "success";
  durationMs?: number;
};

type Ctx = { push: (t: Omit<Toast, "id">) => void };
const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = useCallback((id: string) => setToasts((arr) => arr.filter((t) => t.id !== id)), []);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((arr) => [...arr, { id, durationMs: 4500, severity: "info", ...t }]);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, toast.durationMs ?? 4500);
    return () => clearTimeout(id);
  }, [onDismiss, toast.durationMs]);

  const sev = toast.severity ?? "info";
  const tone = {
    info: "border-[var(--color-cyan-dim)]/50 text-[var(--color-cyan)]",
    success: "border-[var(--color-mint-dim)]/50 text-[var(--color-mint)]",
    warning: "border-[var(--color-amber-dim)]/50 text-[var(--color-amber)]",
    critical: "border-[var(--color-warn-dim)]/50 text-[var(--color-warn)]",
  }[sev];

  return (
    <div className={`h-panel-raised h-fade-in min-w-[280px] max-w-sm border-l-2 px-3 py-2.5 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="h-mono text-[10px] uppercase tracking-wider opacity-80">{sev}</div>
        <button onClick={onDismiss} className="text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] text-xs">
          ✕
        </button>
      </div>
      <div className="text-sm font-medium text-[var(--color-ink)] mt-1">{toast.title}</div>
      {toast.body && <div className="text-xs text-[var(--color-ink-mid)] mt-1">{toast.body}</div>}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
