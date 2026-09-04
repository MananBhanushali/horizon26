// Indian rupee formatter with lakh/crore grouping.
export function formatINR(amount: number, opts: { compact?: boolean } = {}): string {
  if (!isFinite(amount)) return "—";
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  if (opts.compact) {
    if (abs >= 1_00_00_000) return `${sign}Rs. ${(abs / 1_00_00_000).toFixed(abs >= 10_00_00_000 ? 1 : 2)} Cr`;
    if (abs >= 1_00_000) return `${sign}Rs. ${(abs / 1_00_000).toFixed(abs >= 10_00_000 ? 1 : 2)} L`;
    if (abs >= 1_000) return `${sign}Rs. ${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
    return `${sign}Rs. ${Math.round(abs).toLocaleString("en-IN")}`;
  }
  return `${sign}Rs. ${Math.round(abs).toLocaleString("en-IN")}`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatDelta(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "" : "±";
  return `${sign}${value.toFixed(2)}`;
}

export function timeAgo(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
