"use client";

import { AdminTopStats } from "@/components/admin/AdminTopStats";
import { ApproachingEligibilityCard } from "@/components/admin/ApproachingEligibilityCard";
import { BackToWorkWatchlist } from "@/components/admin/BackToWorkWatchlist";
import { DeptLoadCard } from "@/components/admin/DeptLoadCard";
import { LoadingState } from "@/components/ui/Spinner";
import { useAdminOverview } from "@/hooks/useAdminOverview";
import { formatDayMonthUpper, formatShortDate, parseISODateOnly } from "@/lib/date";
import {
  AdminBackToWorkRowRecord,
  AdminDepartmentLoadRecord,
  AdminEligibilityCandidate,
  BackToWorkRow,
  DepartmentLoad,
  EligibilityItem,
} from "@/types/domain";

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

function mapEligibilityItem(candidate: AdminEligibilityCandidate): EligibilityItem {
  const year = parseISODateOnly(candidate.joiningDate).getUTCFullYear();
  return {
    id: String(candidate.employeeId),
    initials: getInitials(candidate.name),
    name: candidate.name,
    joinedLabel: `${formatDayMonthUpper(candidate.joiningDate)} ${year}`,
    daysUntilEligible: candidate.daysUntilEligible,
  };
}

function mapDepartmentLoad(record: AdminDepartmentLoadRecord): DepartmentLoad {
  return {
    id: record.department,
    name: record.department,
    onLeave: record.onLeave,
    headcount: record.headcount,
  };
}

export function AdminDashboard() {
  // Only mounted by DashboardPage once the real session's role is confirmed "admin".
  const { data, isLoading, error } = useAdminOverview(true);

  if (error) {
    return (
      <div className="rounded-[12px] border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-[13px] text-status-rejected-fg">
        Couldn&rsquo;t load the admin overview: {error}
      </div>
    );
  }

  if (isLoading || !data) {
    return <LoadingState label="Loading company overview…" />;
  }

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <AdminTopStats {...data.stats} pendingUnpaidExtensions={0} pendingApproachingEligibility={0} />
      <div className="grid items-stretch gap-[16px] lg:grid-cols-[1.6fr_1fr]">
        <BackToWorkWatchlist rows={data.backToWorkWatchlist.map(mapBackToWorkRow)} />
        <div className="flex flex-col gap-[16px]">
          <ApproachingEligibilityCard items={data.approachingEligibility.map(mapEligibilityItem)} />
          <DeptLoadCard departments={data.departmentLoad.map(mapDepartmentLoad)} />
        </div>
      </div>
    </div>
  );
}
