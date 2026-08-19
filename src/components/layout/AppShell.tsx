"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {mobileOpen ? (
        <div
          onClick={() => setMobileOpen(false)}
          className="animate-mz-in fixed inset-0 z-[70] bg-[rgba(14,15,17,0.5)] backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      <main className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setMobileOpen(true)} />
        <div className="min-w-0 flex-1 p-[16px] lg:p-[22px]">{children}</div>
      </main>
    </div>
  );
}
