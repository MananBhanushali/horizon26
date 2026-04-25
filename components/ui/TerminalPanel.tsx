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
  noPadding,
  className = "",
  bodyClassName = "",
  children,
}: Props) {
  const baseClass = raised ? "h-panel-raised" : "h-panel";
  return (
    <section
      className={`${baseClass} ${active ? "h-panel-active" : ""} overflow-hidden ${className}`}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
          <div className="min-w-0">
            {title && (
              <div className="text-base font-semibold tracking-tight truncate">
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
      <div className={`${noPadding ? "" : "px-5 pb-5 pt-2"} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
