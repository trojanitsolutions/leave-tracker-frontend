"use client";

import Link from "next/link";
import { EmployeesScreen } from "@/components/admin/EmployeesScreen";
import { useAuth } from "@/context/AuthContext";

export default function EmployeesPage() {
  const { employee, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-[13px] text-muted">Loading…</div>;
  }

  if (!employee) {
    return (
      <div className="rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
        <div className="text-[15px] font-semibold">Sign in to manage employees</div>
        <div className="mx-auto mt-[8px] max-w-[360px] text-[13px] leading-relaxed text-muted">
          This screen manages real employee records — sign in with an Admin/HR account first.
        </div>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-[8px] bg-primary px-[15px] py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (employee.role !== "admin") {
    return (
      <div className="rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
        <div className="text-[15px] font-semibold">Admins only</div>
        <div className="mx-auto mt-[8px] max-w-[360px] text-[13px] leading-relaxed text-muted">
          Employee management is restricted to Admin/HR accounts.
        </div>
      </div>
    );
  }

  return <EmployeesScreen />;
}
