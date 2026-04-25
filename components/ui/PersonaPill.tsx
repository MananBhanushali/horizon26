"use client";

import type { Persona } from "@/lib/types";

export function PersonaPill({
  persona,
  active,
  onClick,
}: {
  persona: Pick<Persona, "id" | "name" | "title" | "tagline" | "age" | "riskBand">;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2.5 rounded-md border px-3 py-1.5 text-left transition-all ${
        active
          ? "border-[var(--color-cyan-dim)] bg-[var(--color-cyan-soft)] text-[var(--color-ink)]"
          : "border-[var(--color-edge)] bg-[var(--color-panel)] text-[var(--color-ink-mid)] hover:border-[var(--color-edge-strong)] hover:text-[var(--color-ink)]"
      }`}
      aria-pressed={active}
    >
      <span
        className={`h-7 w-7 grid place-items-center rounded-full border text-[11px] h-mono uppercase ${
          active
            ? "border-[var(--color-cyan-dim)] bg-[var(--color-base)] text-[var(--color-cyan)]"
            : "border-[var(--color-edge-strong)] bg-[var(--color-base)] text-[var(--color-ink-mid)]"
        }`}
        aria-hidden
      >
        {persona.name.charAt(0)}
      </span>
      <span className="flex flex-col leading-tight min-w-0">
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <span className="truncate">{persona.name}</span>
          <span className="h-mono text-[10px] text-[var(--color-ink-dim)]">·{persona.age}</span>
        </span>
        <span className="text-[10px] text-[var(--color-ink-dim)] truncate max-w-[150px]">
          {persona.tagline}
        </span>
      </span>
    </button>
  );
}
