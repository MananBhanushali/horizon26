"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PRIMARY: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Dashboard", href: "/dashboard", icon: <HomeIcon /> },
  { label: "My money", href: "/dashboard?edit=money", icon: <WalletIcon /> },
  { label: "My investments", href: "/investments", icon: <TrendIcon /> },
  { label: "Timeline", href: "/timeline", icon: <TimelineIcon /> },
  { label: "Allocation", href: "/allocation", icon: <DonutIcon /> },
  { label: "What-if", href: "/sandbox", icon: <RefreshIcon /> },
  { label: "Settings", href: "/settings", icon: <SettingsIcon /> },
];

const SECONDARY: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Allocation Logic", href: "/black-litterman", icon: <SparkIcon /> },
  { label: "Macro", href: "/macro", icon: <PulseIcon /> },
  { label: "Tax", href: "/tax", icon: <ReceiptIcon /> },
  { label: "Instruments", href: "/instruments", icon: <ListIcon /> },
  { label: "Scenarios", href: "/scenarios", icon: <BranchIcon /> },
  { label: "Alerts", href: "/alerts", icon: <BellIcon /> },
];

export function LeftRail() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden lg:flex flex-col gap-2 bg-[var(--color-lavender-soft)] px-3 py-5 w-[220px] shrink-0 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto rounded-tr-[28px] rounded-br-[28px]"
      aria-label="Primary"
    >
      <div className="flex flex-col gap-1.5">
        {PRIMARY.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
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
          {SECONDARY.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-full px-4 py-2 text-xs transition-colors ${
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

      <div className="mt-auto px-3 pt-3 text-[10px] text-[var(--color-ink-dim)] leading-relaxed">
        Not financial advice. All numbers illustrative.
      </div>
    </nav>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function HomeIcon() { return (<Icon><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9h14v-9" /><path d="M10 19v-5h4v5" /></Icon>); }
function WalletIcon() { return (<Icon><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18" /><circle cx="16.5" cy="14.5" r="1.2" /></Icon>); }
function TrendIcon() { return (<Icon><path d="M4 17h16" /><path d="m5 14 4-4 3 3 6-6" /><path d="M15 7h3v3" /></Icon>); }
function TimelineIcon() { return (<Icon><path d="M3 12h18" /><circle cx="7" cy="12" r="2" /><circle cx="13" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></Icon>); }
function DonutIcon() { return (<Icon><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 4v8l6 4" /></Icon>); }
function RefreshIcon() { return (<Icon><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 4v4h-4" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 20v-4h4" /></Icon>); }
function SettingsIcon() { return (<Icon><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /><circle cx="12" cy="12" r="3.5" /></Icon>); }
function SparkIcon() { return (<Icon><path d="M12 4v6M12 14v6M4 12h6M14 12h6" /></Icon>); }
function PulseIcon() { return (<Icon><path d="M3 12h4l2-6 4 12 2-6h6" /></Icon>); }
function ReceiptIcon() { return (<Icon><path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3" /><path d="M8 8h8M8 12h8M8 16h5" /></Icon>); }
function ListIcon() { return (<Icon><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="2" cy="6" r="0.7" fill="currentColor" /><circle cx="2" cy="12" r="0.7" fill="currentColor" /><circle cx="2" cy="18" r="0.7" fill="currentColor" /></Icon>); }
function BranchIcon() { return (<Icon><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="12" r="2" /><path d="M6 8v8" /><path d="M8 6h6a4 4 0 0 1 4 4v0" /></Icon>); }
function BellIcon() { return (<Icon><path d="M6 9a6 6 0 0 1 12 0v4l1.5 3h-15L6 13Z" /><path d="M10 19a2 2 0 0 0 4 0" /></Icon>); }
