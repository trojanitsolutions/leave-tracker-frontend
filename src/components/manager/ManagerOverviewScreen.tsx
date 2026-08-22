"use client";

import { BackToWorkWatchlist } from "@/components/admin/BackToWorkWatchlist";
import { ManagerOverviewStatCards } from "@/components/manager/ManagerOverviewStatCards";
import { TeamOnLeaveCard } from "@/components/manager/TeamOnLeaveCard";
import { LoadingState } from "@/components/ui/Spinner";
import { useManagerOverview } from "@/hooks/useManagerOverview";
import { formatRangeLabelUpper, formatShortDate } from "@/lib/date";
import { AdminBackToWorkRowRecord, BackToWorkRow, ManagerOnLeaveRowRecord, OnLeaveRow } from "@/types/domain";

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function mapOnLeaveRow(record: ManagerOnLeaveRowRecord): OnLeaveRow {
  return {
    id: `${record.employeeId}-${record.startDate}`,
    initials: getInitials(record.name),
    name: record.name,
    department: record.department ?? "—",
    leaveTypeId: record.leaveTypeId,
    leaveTypeName: record.leaveTypeName,
    dates: formatRangeLabelUpper(record.startDate, record.endDate),
    backToWork: formatShortDate(record.expectedBackToWorkDate),
  };
}

function mapBackToWorkRow(record: AdminBackToWorkRowRecord): BackToWorkRow {
  return {
    id: `${record.employeeId}-${record.expectedBackToWorkDate}`,
    initials: getInitials(record.name),
    name: record.name,
    department: record.department ?? "—",
    expectedBackToWork: formatShortDate(record.expectedBackToWorkDate),
    actualBackToWork: record.actualBackToWorkDate ? formatShortDate(record.actualBackToWorkDate) : null,
    status: record.status,
  };
}

export function ManagerOverviewScreen() {
  // Only mounted by DashboardPage once the real session's role is confirmed "manager".
  const { data, isLoading, error } = useManagerOverview(true);

  if (error) {
    return (
      <div className="rounded-[12px] border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-[13px] text-status-rejected-fg">
        Couldn&rsquo;t load your team overview: {error}
      </div>
    );
  }

  if (isLoading || !data) {
    return <LoadingState label="Loading team overview…" />;
  }

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <ManagerOverviewStatCards {...data.stats} />
      <div className="grid items-start gap-[16px] lg:grid-cols-[1fr_1.4fr]">
        <TeamOnLeaveCard rows={data.currentlyOnLeave.map(mapOnLeaveRow)} />
        <BackToWorkWatchlist rows={data.backToWorkWatchlist.map(mapBackToWorkRow)} />
      </div>
    </div>
  );
}
