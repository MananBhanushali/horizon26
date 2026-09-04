"use client";

import { ReactNode } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { LeftRail } from "@/components/shell/LeftRail";
import { useApp } from "@/components/providers/AppProvider";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const { hydrated, session } = useApp();

  if (!hydrated) {
    return (
      <div className="grid place-items-center min-h-screen">
        <div className="text-sm text-[var(--color-ink-mid)]">Loading…</div>
      </div>
    );
  }
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <LeftRail />
        <main className="flex-1 min-w-0 px-3 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-5 pb-8">
          <div className="h-cross max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
