"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { NAV_ITEMS } from "@/data/mock";

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user } = useRole();
  const { employee, logout } = useAuth();
  const navItems = NAV_ITEMS[role];

  // Real logged-in identity always wins over the mock "viewing as" persona,
  // regardless of role — a real manager or admin sees their own name too.
  const displayName = employee ? employee.fullName : user.fullName;
  const displayCode = employee ? employee.employeeCode : user.employeeCode;
  const displayInitials = employee ? getInitials(employee.fullName) : user.initials;

  async function handleSignOut() {
    await logout();
    router.push("/login");
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[80] flex h-screen w-[268px] flex-none flex-col gap-[20px] bg-deep p-[14px] pt-[18px] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:sticky lg:top-0 lg:z-20 lg:translate-x-0 ${
        mobileOpen ? "translate-x-0 shadow-[8px_0_30px_rgba(0,0,0,0.35)]" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-[10px] px-[6px]">
        <Image
          src="/trojan-logo.webp"
          alt="Trojan Technologies"
          width={799}
          height={138}
          className="h-[32px] w-auto flex-none brightness-0 invert"
          priority
        />
        <div className="ml-auto flex-none rounded-[5px] border border-white/[0.14] px-[5px] py-[2px] font-mono text-[9px] tracking-[0.06em] text-white/[0.32]">
          {user.roleTag}
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-7 w-7 flex-none items-center justify-center rounded-[8px] bg-white/[0.08] text-[15px] text-white/75 transition-colors hover:bg-white/[0.16] hover:text-white lg:hidden"
        >
          ×
        </button>
      </div>

      <nav className="no-scrollbar flex flex-1 flex-col gap-[2px] overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-[10px] rounded-[8px] px-[10px] py-2 text-[13px] font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-white/[0.12] text-white"
                  : "text-white/[0.62] hover:bg-white/[0.09] hover:text-white"
              }`}
            >
              <span
                className={`h-[5px] w-[5px] flex-none rounded-full ${
                  active ? "bg-accent" : "bg-white/[0.28]"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-accent px-[6px] py-[1px] font-mono text-[10px] font-medium text-[#04252B]">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center gap-[10px] rounded-[10px] px-[10px] py-[9px] transition-colors hover:bg-white/[0.06]">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-accent text-[11.5px] font-semibold text-[#04252B]">
            {displayInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-medium text-white">{displayName}</div>
            <div className="font-mono text-[10px] text-white/[0.4]">{displayCode}</div>
          </div>
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="text-[14px] text-white/[0.4] transition-colors hover:text-white"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
