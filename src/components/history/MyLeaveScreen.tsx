"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { LoadingState } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useEmployeeOverview } from "@/hooks/useEmployeeOverview";
import { useLeaveCycles } from "@/hooks/useLeaveCycles";
import { useLeaveHistory } from "@/hooks/useLeaveHistory";
import { formatRangeLabelUpper, formatShortDate, parseISODateOnly, todayUTC } from "@/lib/date";

export function MyLeaveScreen() {
  const { employee } = useAuth();
  const { overview } = useEmployeeOverview(Boolean(employee));
  const { entries, isLoading } = useLeaveHistory(Boolean(employee));
  const { cycles, isLoading: isCyclesLoading } = useLeaveCycles(Boolean(employee));

  const upcoming = useMemo(() => {
    const today = todayUTC();
    return entries
      .filter((e) => e.status !== "rejected" && e.status !== "cancelled")
      .filter((e) => parseISODateOnly(e.startDate).getTime() > today.getTime())
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [entries]);

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <Card className="p-[20px]">
        <div className="mb-[12px] text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
          Current status
        </div>
        {overview?.status === "on_leave" && overview.currentLeave ? (
          <div className="text-[13.5px]">
            On {(overview.currentLeaveTypeName ?? "leave").toLowerCase()}{" "}
            <b>
              {formatShortDate(overview.currentLeave.startDate)} –{" "}
              {formatShortDate(overview.currentLeave.endDate)}
            </b>
            . Expected back at work{" "}
            <b>{formatShortDate(overview.currentLeave.expectedBackToWorkDate)}</b>.
          </div>
        ) : overview?.status === "on_unpaid_extension" && overview.currentExtension ? (
          <div className="text-[13.5px]">
            On an unpaid extension{" "}
            <b>
              {formatShortDate(overview.currentExtension.startDate)} –{" "}
              {formatShortDate(overview.currentExtension.endDate)}
            </b>
            .
          </div>
        ) : (
          <div className="text-[13.5px] text-muted">Not currently on leave.</div>
        )}
        <div className="mt-[14px] flex gap-2">
          <Link
            href="/apply"
            className="rounded-[8px] bg-primary px-[14px] py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black"
          >
            Apply for annual leave
          </Link>
          {overview?.status === "on_leave" ? (
            <Link
              href="/extend"
              className="rounded-[8px] border border-accent bg-card px-[14px] py-2 text-[12.5px] font-semibold text-accent transition-colors hover:bg-accent-tint"
            >
              Request extension
            </Link>
          ) : null}
        </div>
      </Card>

      <Card className="p-[20px]">
        <div className="mb-[12px] text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
          Upcoming
        </div>
        {isLoading ? (
          <LoadingState label="Loading upcoming leave…" />
        ) : upcoming.length === 0 ? (
          <div className="text-[12.5px] text-muted">Nothing upcoming — apply for leave any time.</div>
        ) : (
          <div className="flex flex-col gap-[11px]">
            {upcoming.map((entry) => (
              <div
                key={`${entry.kind}-${entry.id}`}
                className="flex items-center justify-between gap-3 border-b border-[#EFF0F2] pb-[11px] last:border-b-0 last:pb-0"
              >
                <div>
                  <div className="text-[13px] font-medium">{entry.leaveTypeName}</div>
                  <div className="font-mono text-[11.5px] text-muted">
                    {formatRangeLabelUpper(entry.startDate, entry.endDate)} · {entry.numberOfDays} days
                  </div>
                </div>
                <StatusPill status={entry.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-[20px]">
        <div className="mb-[3px] text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
          Leave cycle history
        </div>
        <div className="mb-[12px] text-[11.5px] text-muted">
          A permanent record of each entitlement cycle, confirmed once HR records your actual
          back-to-work date.
        </div>
        {isCyclesLoading ? (
          <LoadingState label="Loading cycle history…" />
        ) : cycles.length === 0 ? (
          <div className="text-[12.5px] text-muted">
            No confirmed cycles yet — this fills in once your first leave is recorded as returned.
          </div>
        ) : (
          <div className="flex flex-col gap-[11px]">
            {cycles.map((cycle) => (
              <div
                key={cycle.id}
                className="flex items-center justify-between gap-3 border-b border-[#EFF0F2] pb-[11px] last:border-b-0 last:pb-0"
              >
                <div>
                  <div className="text-[13px] font-medium">
                    {formatRangeLabelUpper(cycle.cycleStart, cycle.cycleEnd)}
                  </div>
                  <div className="font-mono text-[11.5px] text-muted">
                    {cycle.entitlementDays} days entitlement
                  </div>
                </div>
                <span className="rounded-full bg-status-cancelled-bg px-[9px] py-[3px] text-[11px] font-medium text-status-cancelled-fg">
                  {cycle.generatedReason === "initial" ? "First cycle" : "Renewed"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
