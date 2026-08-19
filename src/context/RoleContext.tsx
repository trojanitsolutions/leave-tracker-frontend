"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_USERS } from "@/data/mock";
import { CurrentUser, UserRole } from "@/types/domain";

export type ActiveView = "admin" | "employee";

interface RoleContextValue {
  role: UserRole;
  user: CurrentUser;
  setRole: (role: UserRole) => void;
  /** False once a real session exists — the "viewing as" toggle stops applying. */
  isPreview: boolean;
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
 * "VIEWING AS" preview switcher for the Manager/Admin dashboards, which don't
 * have real auth-driven data yet. Once a real session exists (`AuthContext`),
 * the real role always wins over the toggle — a logged-in manager sees the
 * Manager dashboard regardless of what the toggle is set to.
 */
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { employee } = useAuth();
  const [previewRole, setPreviewRole] = useState<UserRole>("employee");
  const [activeView, setActiveView] = useState<ActiveView>("admin");

  const role = employee?.role ?? previewRole;
  const isPreview = !employee;

  // Reset to the admin view whenever the signed-in account changes (login/logout/switch),
  // so a stale "employee view" from a previous session never leaks into a new one.
  useEffect(() => {
    setActiveView("admin");
  }, [employee?.id]);

  const value = useMemo<RoleContextValue>(
    () => ({ role, user: MOCK_USERS[role], setRole: setPreviewRole, isPreview, activeView, setActiveView }),
    [role, isPreview, activeView],
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
