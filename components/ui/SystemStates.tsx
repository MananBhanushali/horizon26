import { ReactNode } from "react";

export function SkeletonBlock({ height = 24, width, className = "" }: { height?: number; width?: number | string; className?: string }) {
  return (
    <div
      className={`h-shimmer rounded ${className}`}
      style={{ height, width: width ?? "100%", backgroundColor: "var(--color-edge)" }}
      aria-hidden
    />
  );
}

export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="h-panel-raised p-4">
      <SkeletonBlock height={12} width="40%" className="mb-3" />
      <SkeletonBlock height={28} width="60%" className="mb-3" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonBlock key={i} height={14} />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: ReactNode;
}) {
  return (
    <div className="h-panel-raised flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="h-tick text-[var(--color-cyan)]">EMPTY STATE</div>
      <div className="text-lg font-medium tracking-tight">{title}</div>
      <p className="text-sm text-[var(--color-ink-mid)] max-w-md">{body}</p>
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  body,
  onRetry,
  diagnostic,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
  diagnostic?: string;
}) {
  return (
    <div className="h-panel-raised flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="h-tick text-[var(--color-warn)]">ERROR</div>
      <div className="text-lg font-medium tracking-tight text-[var(--color-warn)]">{title}</div>
      <p className="text-sm text-[var(--color-ink-mid)] max-w-md">{body}</p>
      {diagnostic && (
        <pre className="h-mono text-[11px] text-[var(--color-ink-dim)] bg-[var(--color-base)] rounded px-3 py-2 max-w-md whitespace-pre-wrap">
          {diagnostic}
        </pre>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="h-mono text-xs rounded border border-[var(--color-edge-strong)] px-3 py-1.5 text-[var(--color-cyan)] hover:border-[var(--color-cyan-dim)]"
        >
          RETRY ↻
        </button>
      )}
    </div>
  );
}
