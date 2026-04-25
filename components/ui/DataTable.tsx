"use client";

import { ReactNode, useMemo, useState } from "react";

export type Column<T> = {
  key: string;
  label: ReactNode;
  width?: string; // e.g., "120px" or "minmax(...)"
  align?: "left" | "right" | "center";
  render?: (row: T) => ReactNode;
  sortBy?: (row: T) => number | string;
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  expandable,
  searchableKeys,
  emptyState,
  rowClassName,
}: {
  data: T[];
  columns: Column<T>[];
  expandable?: (row: T) => ReactNode;
  searchableKeys?: ((row: T) => string)[];
  emptyState?: ReactNode;
  rowClassName?: (row: T) => string;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let out = data;
    if (query && searchableKeys && searchableKeys.length) {
      const q = query.toLowerCase();
      out = out.filter((r) => searchableKeys.some((fn) => fn(r).toLowerCase().includes(q)));
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortBy) {
        out = [...out].sort((a, b) => {
          const av = col.sortBy!(a);
          const bv = col.sortBy!(b);
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
      }
    }
    return out;
  }, [data, query, searchableKeys, sortKey, sortDir, columns]);

  const gridTemplate = (expandable ? "32px " : "") + columns.map((c) => c.width ?? "minmax(0,1fr)").join(" ");

  return (
    <div className="flex flex-col gap-2">
      {searchableKeys && (
        <div className="flex items-center gap-2 px-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search instruments…"
            className="h-mono w-full max-w-sm rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5 text-xs placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-cyan-dim)] focus:outline-none"
          />
          <span className="h-tick">{filtered.length} rows</span>
        </div>
      )}
      <div className="rounded-md border border-[var(--color-edge)]">
        {/* Header */}
        <div
          className="grid items-center bg-[var(--color-panel)] border-b border-[var(--color-edge)] px-3 py-2"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {expandable && <span />}
          {columns.map((c) => {
            const sortable = !!c.sortBy;
            const isActive = sortKey === c.key;
            return (
              <button
                key={c.key}
                onClick={() => {
                  if (!sortable) return;
                  if (isActive) setSortDir(sortDir === "asc" ? "desc" : "asc");
                  else {
                    setSortKey(c.key);
                    setSortDir("asc");
                  }
                }}
                className={`h-tick text-left ${
                  c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"
                } ${sortable ? "cursor-pointer hover:text-[var(--color-cyan)]" : "cursor-default"} ${
                  isActive ? "text-[var(--color-cyan)]" : ""
                }`}
              >
                {c.label}
                {sortable && (
                  <span className="ml-1 opacity-60">
                    {isActive ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* Rows */}
        {filtered.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-[var(--color-ink-dim)]">
            {emptyState ?? "No data."}
          </div>
        )}
        {filtered.map((row) => {
          const open = openId === row.id;
          return (
            <div key={row.id} className="border-b border-[var(--color-edge)] last:border-b-0">
              <div
                className={`grid items-center px-3 py-2 hover:bg-[var(--color-raised)]/60 transition-colors ${
                  rowClassName?.(row) ?? ""
                }`}
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {expandable && (
                  <button
                    onClick={() => setOpenId(open ? null : row.id)}
                    className="h-mono text-[var(--color-ink-mid)] hover:text-[var(--color-cyan)] text-xs"
                    aria-expanded={open}
                    aria-label={open ? "Collapse row" : "Expand row"}
                  >
                    {open ? "▾" : "▸"}
                  </button>
                )}
                {columns.map((c) => (
                  <div
                    key={c.key}
                    className={`text-[12.5px] ${
                      c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {c.render ? c.render(row) : (row as Record<string, ReactNode>)[c.key]}
                  </div>
                ))}
              </div>
              {expandable && open && (
                <div className="border-t border-[var(--color-edge)] bg-[var(--color-base)] px-4 py-3 h-fade-in">
                  {expandable(row)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
