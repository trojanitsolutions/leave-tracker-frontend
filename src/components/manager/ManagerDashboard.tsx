"use client";

import { QueueList } from "@/components/manager/QueueList";
import { QueueStatCards } from "@/components/manager/QueueStatCards";
import { RealQueueList } from "@/components/manager/RealQueueList";
import { useAuth } from "@/context/AuthContext";
import { useManagerQueue } from "@/hooks/useManagerQueue";

export function ManagerDashboard() {
  const { employee } = useAuth();
  const isRealManager = employee?.role === "manager";
  const { data, isLoading, error, refresh } = useManagerQueue(isRealManager);

  if (isRealManager) {
    return (
      <div className="flex w-full flex-col gap-[16px]">
        <QueueStatCards {...(data?.stats ?? {})} />
        <RealQueueList
          queue={data?.queue ?? []}
          isLoading={isLoading}
          error={error}
          onRefresh={refresh}
        />
      </div>
    );
  }

  // Not authenticated as a real manager (or previewing via "viewing as") —
  // original mocked experience, unchanged.
  return (
    <div className="flex w-full flex-col gap-[16px]">
      <QueueStatCards />
      <QueueList />
    </div>
  );
}
