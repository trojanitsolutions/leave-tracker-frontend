"use client";

import { TeamHistoryScreen } from "@/components/manager/TeamHistoryScreen";
import { useAuth } from "@/context/AuthContext";

export default function TeamHistoryPage() {
  const { employee } = useAuth();

  if (employee?.role !== "manager") {
    return (
      <div className="rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
        <div className="text-[15px] font-semibold">Managers only</div>
        <div className="mx-auto mt-[8px] max-w-[360px] text-[13px] leading-relaxed text-muted">
          Team leave history is only available to Manager accounts.
        </div>
      </div>
    );
  }

  return <TeamHistoryScreen />;
}
