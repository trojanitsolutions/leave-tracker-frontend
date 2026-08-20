"use client";

import { QueueStatCards } from "@/components/manager/QueueStatCards";
import { RealQueueList } from "@/components/manager/RealQueueList";
import { LoadingState } from "@/components/ui/Spinner";
import { useManagerQueue } from "@/hooks/useManagerQueue";

export function ManagerDashboard() {
  // Only mounted by ApprovalsPage once the real session's role is confirmed "manager".
  const { data, isLoading, error, refresh } = useManagerQueue(true);

  if (error) {
    return (
      <div className="rounded-[12px] border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-[13px] text-status-rejected-fg">
        Couldn&rsquo;t load the queue: {error}
      </div>
    );
  }

  if (isLoading || !data) {
    return <LoadingState label="Loading your approval queue…" />;
  }

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <QueueStatCards {...data.stats} />
      <RealQueueList queue={data.queue} isLoading={false} error={null} onRefresh={refresh} />
    </div>
  );
}
