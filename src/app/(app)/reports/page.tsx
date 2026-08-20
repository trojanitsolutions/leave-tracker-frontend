"use client";

import { ReportsScreen } from "@/components/admin/ReportsScreen";
import { useAuth } from "@/context/AuthContext";

export default function ReportsPage() {
  const { employee } = useAuth();

  if (employee?.role !== "admin") {
    return (
      <div className="rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
        <div className="text-[15px] font-semibold">Admin / HR only</div>
        <div className="mx-auto mt-[8px] max-w-[360px] text-[13px] leading-relaxed text-muted">
          Leave reports are only available to Admin/HR accounts.
        </div>
      </div>
    );
  }

  return <ReportsScreen />;
}
