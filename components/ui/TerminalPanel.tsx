import { ReactNode } from "react";

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  active?: boolean;
  raised?: boolean;
  scanline?: boolean;
  noPadding?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export function TerminalPanel({
  title,
  subtitle,
  actions,
  active,
  raised,
  scanline,
  noPadding,
  className = "",
  bodyClassName = "",
  children,
}: Props) {
  const baseClass = raised ? "h-panel-raised" : "h-panel";
  return (
    <section
      className={`${baseClass} ${active ? "h-panel-active" : ""} ${
        scanline ? "h-scanline" : ""
      } overflow-hidden ${className}`}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-edge)] px-4 py-2.5">
          <div className="min-w-0">
            {title && (
              <div className="h-tick truncate text-[10.5px] tracking-[0.16em] text-[var(--color-ink-mid)]">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-xs text-[var(--color-ink-dim)] mt-0.5 truncate">
                {subtitle}
              </div>
            )}
          </div>
          {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={`${noPadding ? "" : "p-4"} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
