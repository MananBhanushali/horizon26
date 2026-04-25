"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";

export default function Index() {
  const { hydrated, session } = useApp();
  const router = useRouter();
  useEffect(() => {
    if (!hydrated) return;
    router.replace(session ? "/dashboard" : "/login");
  }, [hydrated, session, router]);

  return (
    <div className="grid place-items-center min-h-[60vh]">
      <div className="h-tick">BOOTING TERMINAL…</div>
    </div>
  );
}
