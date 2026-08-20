"use client";

import { AuditHistoryScreen } from "@/components/admin/AuditHistoryScreen";
import { useAuth } from "@/context/AuthContext";

export default function AuditPage() {
  const { employee } = useAuth();

  if (employee?.role !== "admin") {
    return (
      <div className="rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
        <div className="text-[15px] font-semibold">Admins only</div>
        <div className="mx-auto mt-[8px] max-w-[360px] text-[13px] leading-relaxed text-muted">
          Audit history is restricted to Admin/HR accounts.
        </div>
      </div>
    );
  }

  return <AuditHistoryScreen />;
}
