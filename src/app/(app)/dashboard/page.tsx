"use client";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { ManagerOverviewScreen } from "@/components/manager/ManagerOverviewScreen";
import { useRole } from "@/context/RoleContext";

export default function DashboardPage() {
  const { role, activeView } = useRole();

  if (role === "manager") return <ManagerOverviewScreen />;
  if (role === "admin") return activeView === "employee" ? <EmployeeDashboard /> : <AdminDashboard />;
  return <EmployeeDashboard />;
}
