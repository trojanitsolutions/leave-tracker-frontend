"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/domain";

export type ActiveView = "admin" | "employee";

interface RoleContextValue {
  role: UserRole;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { employee } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>("admin");

  const role = employee?.role ?? "employee";

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
