"use client";

import { useMemo } from "react";
import { AwaitingDecisionCard } from "@/components/dashboard/AwaitingDecisionCard";
import { LeaveBalanceCard } from "@/components/dashboard/LeaveBalanceCard";
import { OnLeaveBanner } from "@/components/dashboard/OnLeaveBanner";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { RecentRequestsTable } from "@/components/dashboard/RecentRequestsTable";
import { LoadingState } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useEmployeeOverview } from "@/hooks/useEmployeeOverview";
import {
  daysSinceISO,
  formatCycleLabel,
  formatRangeLabelUpper,
  formatShortDate,
  parseISODateOnly,
  todayUTC,
} from "@/lib/date";
import { RecentLeaveRow } from "@/types/domain";

export function EmployeeDashboard() {
  const { employee } = useAuth();
  const { overview, isLoading, error } = useEmployeeOverview(Boolean(employee));

  const recentRows = useMemo<RecentLeaveRow[] | undefined>(() => {
    if (!overview) return undefined;
    return overview.recent.map((r) => ({
      id: `${r.kind}-${r.id}`,
      type: r.leaveTypeName,
      dates: formatRangeLabelUpper(r.startDate, r.endDate),
      days: r.numberOfDays,
      backToWork: formatShortDate(r.backToWorkDate),
      status: r.status,
      isChild: r.kind === "extension",
    }));
  }, [overview]);

  if (error) {
    return (
      <div className="rounded-[12px] border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-[13px] text-status-rejected-fg">
        Couldn&rsquo;t load your dashboard: {error}
      </div>
    );
  }

  if (isLoading || !overview) {
    return <LoadingState label="Loading your dashboard…" />;
  }

  const {
    balance,
    status,
    currentLeave,
    currentExtension,
    currentLeaveTypeName,
    recent,
    managerName,
    managerDepartment,
  } = overview;
  const pendingRequests = recent.filter((r) => r.status === "pending");
  const oldestPending = pendingRequests[pendingRequests.length - 1];

  let banner: {
    label: string;
    dayNumber: number;
    totalDays: number;
    expectedBackToWork: string;
    progressPercent: number;
    showExtensionCta: boolean;
  } | null = null;

  if (status === "on_leave" && currentLeave) {
    const totalDays = currentLeave.numberOfDays;
    const elapsedDays = Math.round(
      (todayUTC().getTime() - parseISODateOnly(currentLeave.startDate).getTime()) / (24 * 60 * 60 * 1000),
    );
    const dayNumber = Math.min(totalDays, Math.max(1, elapsedDays + 1));
    banner = {
      label: currentLeaveTypeName ?? "On Leave",
      dayNumber,
      totalDays,
      expectedBackToWork: formatShortDate(currentLeave.expectedBackToWorkDate),
      progressPercent: Math.round((dayNumber / totalDays) * 100),
      showExtensionCta: true,
    };
  } else if (status === "on_unpaid_extension" && currentExtension) {
    const totalDays = currentExtension.numberOfDays;
    const elapsedDays = Math.round(
      (todayUTC().getTime() - parseISODateOnly(currentExtension.startDate).getTime()) / (24 * 60 * 60 * 1000),
    );
    const dayNumber = Math.min(totalDays, Math.max(1, elapsedDays + 1));
    const backToWork = toBackToWork(currentExtension.endDate);
    banner = {
      label: currentLeaveTypeName ?? "On Unpaid Extension",
      dayNumber,
      totalDays,
      expectedBackToWork: formatShortDate(backToWork),
      progressPercent: Math.round((dayNumber / totalDays) * 100),
      showExtensionCta: false,
    };
  }

  return (
    <div className="flex w-full flex-col gap-[16px]">
      {banner ? (
        <OnLeaveBanner
          label={banner.label}
          dayNumber={banner.dayNumber}
          totalDays={banner.totalDays}
          expectedBackToWork={banner.expectedBackToWork}
          progressPercent={banner.progressPercent}
          showExtensionCta={banner.showExtensionCta}
        />
      ) : null}
      <div className="grid gap-[16px] lg:grid-cols-[1.62fr_1fr]">
        <LeaveBalanceCard
          isEligible={balance.isEligible}
          cycleLabel={formatCycleLabel(balance.cycleStart, balance.cycleEnd)}
          eligibleFromLabel={formatShortDate(balance.cycleStart)}
          entitlement={balance.entitlement}
          used={balance.used}
          pending={balance.pending}
          remaining={balance.remaining}
          nextCycleStartsOn={balance.nextCycleStartsOn ? formatShortDate(balance.nextCycleStartsOn) : null}
        />
        <div className="flex flex-col gap-[16px]">
          <QuickActionsCard />
          <AwaitingDecisionCard
            managerName={managerName ?? "No manager assigned"}
            managerRole={managerName ? `Your manager${managerDepartment ? ` · ${managerDepartment}` : ""}` : ""}
            pendingCount={pendingRequests.length}
            oldestPendingDays={oldestPending ? daysSinceISO(oldestPending.submittedAt) : 0}
          />
        </div>
      </div>
      <RecentRequestsTable rows={recentRows ?? []} />
    </div>
  );
}

function toBackToWork(extensionEndIso: string): string {
  const end = parseISODateOnly(extensionEndIso);
  const next = new Date(end);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}
