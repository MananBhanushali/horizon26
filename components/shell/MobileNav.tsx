"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Home", href: "/dashboard", icon: <HomeIcon /> },
  { label: "Wallet", href: "/instruments", icon: <WalletIcon /> },
  { label: "Market", href: "/allocation", icon: <MarketIcon /> },
  { label: "Transfer", href: "/timeline", icon: <TransferIcon /> },
  { label: "Settings", href: "/settings", icon: <SettingsIcon /> },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="lg:hidden fixed bottom-3 left-3 right-3 z-30 rounded-full bg-white shadow-lg border border-[var(--color-edge)]"
      aria-label="Mobile primary"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((i) => {
          const active = pathname === i.href;
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-[10px] ${
                  active ? "text-[var(--color-cyan)] font-semibold" : "text-[var(--color-ink-mid)]"
                }`}
              >
                <span className="grid place-items-center h-5 w-5">{i.icon}</span>
                <span>{i.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
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
function MarketIcon() { return (<Icon><path d="M4 10v9h16v-9" /><path d="M3 10l2-5h14l2 5" /><path d="M10 19v-5h4v5" /></Icon>); }
function TransferIcon() { return (<Icon><path d="M4 8h13" /><path d="m14 5 3 3-3 3" /><path d="M20 16H7" /><path d="m10 13-3 3 3 3" /></Icon>); }
function SettingsIcon() { return (<Icon><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /><circle cx="12" cy="12" r="3.5" /></Icon>); }
