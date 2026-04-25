"use client";

import { ReactNode } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { LeftRail } from "@/components/shell/LeftRail";
import { RightRail } from "@/components/shell/RightRail";
import { MobileNav } from "@/components/shell/MobileNav";
import { useApp } from "@/components/providers/AppProvider";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const { hydrated, session } = useApp();

  if (!hydrated) {
    return (
      <div className="grid place-items-center min-h-screen">
        <div className="h-tick">BOOTING TERMINAL…</div>
      </div>
    );
  }
  if (!session) {
    // route guard in AppProvider redirects; this is a safety placeholder
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <LeftRail />
        <main className="flex-1 min-w-0 px-4 py-4 lg:px-6 lg:py-5 pb-20 lg:pb-8">
          <div className="h-cross">{children}</div>
        </main>
        <RightRail />
      </div>
      <MobileNav />
    </div>
  );
}
