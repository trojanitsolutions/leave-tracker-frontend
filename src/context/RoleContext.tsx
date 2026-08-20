"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/domain";

export type ActiveView = "admin" | "employee";

interface RoleContextValue {
  role: UserRole;
  /**
   * Which dashboard/nav an admin is currently looking at — every admin is also
   * an employee who takes leave, so they can switch between their org-management
   * view and their own personal leave screens. Meaningless for other roles.
   */
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

/**
 * Only ever mounted once `AuthenticatedLayout` has confirmed a real signed-in
 * employee, so `role` always reflects the real session — no preview/mock role.
 */
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { employee } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>("admin");

  const role = employee?.role ?? "employee";

  // Reset to the admin view whenever the signed-in account changes (login/logout/switch),
  // so a stale "employee view" from a previous session never leaks into a new one.
  useEffect(() => {
    setActiveView("admin");
  }, [employee?.id]);

  const value = useMemo<RoleContextValue>(
    () => ({ role, activeView, setActiveView }),
    [role, activeView],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}
