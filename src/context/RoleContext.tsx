"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_USERS } from "@/data/mock";
import { CurrentUser, UserRole } from "@/types/domain";

interface RoleContextValue {
  role: UserRole;
  user: CurrentUser;
  setRole: (role: UserRole) => void;
  /** False once a real session exists — the "viewing as" toggle stops applying. */
  isPreview: boolean;
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

  const role = employee?.role ?? previewRole;
  const isPreview = !employee;

  const value = useMemo<RoleContextValue>(
    () => ({ role, user: MOCK_USERS[role], setRole: setPreviewRole, isPreview }),
    [role, isPreview],
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
