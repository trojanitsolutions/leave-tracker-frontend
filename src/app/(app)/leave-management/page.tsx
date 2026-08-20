"use client";

import { LeaveManagementScreen } from "@/components/admin/LeaveManagementScreen";
import { useAuth } from "@/context/AuthContext";

export default function LeaveManagementPage() {
  const { employee } = useAuth();

  if (employee?.role !== "admin") {
    return (
      <div className="rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
        <div className="text-[15px] font-semibold">Admin / HR only</div>
        <div className="mx-auto mt-[8px] max-w-[360px] text-[13px] leading-relaxed text-muted">
          Leave management is only available to Admin/HR accounts.
        </div>
      </div>
    );
  }

  return <LeaveManagementScreen />;
}
