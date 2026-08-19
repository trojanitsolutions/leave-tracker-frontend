"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useRole } from "@/context/RoleContext";
import { formatDateChip } from "@/lib/date";
import { getPageTitle } from "@/lib/pageTitles";

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const { title, subtitle } = getPageTitle(pathname);
  const { role, activeView } = useRole();
  const showApplyCta = role === "employee" || (role === "admin" && activeView === "employee");

  return (
    <header className="sticky top-0 z-20 flex min-h-[64px] flex-none flex-wrap items-center justify-between gap-[10px] border-b border-line bg-white/[0.86] px-[20px] py-[10px] backdrop-blur-[8px]">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[9px] border border-line bg-card transition-colors hover:border-line-hover hover:bg-surface lg:hidden"
        >
          <span className="flex w-[15px] flex-col gap-[3px]">
            <span className="h-[1.5px] rounded-full bg-ink" />
            <span className="h-[1.5px] rounded-full bg-ink" />
            <span className="h-[1.5px] rounded-full bg-ink" />
          </span>
        </button>
        <div className="min-w-0">
          <div className="truncate text-[17px] font-semibold tracking-[-0.02em]">{title}</div>
          {subtitle ? (
            <div className="mt-[1px] truncate font-mono text-[10.5px] text-muted">{subtitle}</div>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-[9px]">
        <div className="hidden items-center gap-[7px] rounded-[8px] border border-line bg-card px-[11px] py-[7px] text-[12.5px] text-muted sm:flex">
          <span className="font-mono text-[10.5px]">{formatDateChip()}</span>
        </div>
        <NotificationBell />
        {showApplyCta ? (
          <Link href="/apply">
            <Button variant="primary">Apply for leave</Button>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
