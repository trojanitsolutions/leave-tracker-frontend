"use client";

import { useMemo } from "react";
import { ChangePasswordCard } from "@/components/profile/ChangePasswordCard";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useEmployeeOverview } from "@/hooks/useEmployeeOverview";
import { useLeaveHistory } from "@/hooks/useLeaveHistory";
import { formatShortDate, parseISODateOnly, todayUTC } from "@/lib/date";
import { EmployeeLeaveStatus, UserRole } from "@/types/domain";

const ROLE_LABELS: Record<UserRole, string> = {
  employee: "Employee",
  manager: "Manager",
  admin: "Admin / HR",
};

const STATUS_PILL: Record<EmployeeLeaveStatus, { label: string; classes: string }> = {
  not_on_leave: { label: "Not on leave", classes: "bg-status-cancelled-bg text-status-cancelled-fg" },
  on_annual_leave: { label: "On Annual Leave", classes: "bg-[#EAF6F9] text-[#08768A]" },
  on_unpaid_extension: { label: "On Unpaid Extension", classes: "bg-[#EDE9FB] text-[#7C5CD6]" },
  returned: { label: "Returned", classes: "bg-status-approved-bg text-status-approved-fg" },
};

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatCycleRange(startIso: string, endIso: string): string {
  const startLabel = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }).format(
    parseISODateOnly(startIso),
  );
  return `${startLabel} – ${formatShortDate(endIso)}`;
}

function formatLengthOfService(joiningIso: string): string {
  const joined = parseISODateOnly(joiningIso);
  const today = todayUTC();
  let years = today.getUTCFullYear() - joined.getUTCFullYear();
  let months = today.getUTCMonth() - joined.getUTCMonth();
  if (today.getUTCDate() < joined.getUTCDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const yearLabel = years === 1 ? "1 year" : `${years} years`;
  const monthLabel = months === 1 ? "1 month" : `${months} months`;
  if (years <= 0) return monthLabel;
  if (months === 0) return yearLabel;
  return `${yearLabel}, ${monthLabel}`;
}

export function ProfileScreen() {
  const { employee } = useAuth();
  const isSignedIn = Boolean(employee);
  const { overview, isLoading, error } = useEmployeeOverview(isSignedIn);
  const { entries } = useLeaveHistory(isSignedIn);

  const unpaidThisCycle = useMemo(() => {
    if (!overview) return { pending: 0, approved: 0 };
    const { cycleStart, cycleEnd } = overview.balance;
    return entries
      .filter((e) => e.kind === "extension" && e.startDate >= cycleStart && e.startDate <= cycleEnd)
      .reduce(
        (acc, e) => {
          if (e.status === "pending") acc.pending += e.numberOfDays;
          if (e.status === "approved") acc.approved += e.numberOfDays;
          return acc;
        },
        { pending: 0, approved: 0 },
      );
  }, [overview, entries]);

  if (isLoading || !overview) {
    return <LoadingState label="Loading your profile…" />;
  }

  if (error) {
    return (
      <div className="rounded-[12px] border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-[13px] text-status-rejected-fg">
        Couldn&rsquo;t load your profile: {error}
      </div>
    );
  }

  const { employee: profile, managerName, status, balance } = overview;
  const pill = STATUS_PILL[status];
  const totalUnpaid = unpaidThisCycle.pending + unpaidThisCycle.approved;

  return (
    <div className="grid w-full grid-cols-1 items-stretch gap-[16px] lg:grid-cols-[1.3fr_1fr]">
      <Card className="flex flex-col">
        <div className="flex items-center gap-[16px] border-b border-line px-[24px] py-[22px]">
          <div className="flex h-[56px] w-[56px] flex-none items-center justify-center rounded-full bg-deep text-[19px] font-semibold text-white">
            {getInitials(profile.fullName)}
          </div>
          <div>
            <div className="text-[19px] font-semibold tracking-[-0.02em]">{profile.fullName}</div>
            <div className="mt-[2px] text-[13px] text-muted">
              {ROLE_LABELS[profile.role]}
              {profile.department ? ` · ${profile.department}` : ""}
            </div>
          </div>
          <span
            className={`ml-auto inline-flex flex-none items-center gap-[6px] rounded-full px-[11px] py-[4px] text-[11.5px] font-semibold ${pill.classes}`}
          >
            <span className="h-[6px] w-[6px] rounded-full bg-current" />
            {pill.label}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-[18px_26px] px-[24px] py-[20px] sm:grid-cols-2">
          <div>
            <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">EMPLOYEE ID</div>
            <div className="mt-[4px] text-[13.5px]">{profile.employeeCode}</div>
          </div>
          <div>
            <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">WORK EMAIL</div>
            <div className="mt-[4px] text-[13.5px]">{profile.email}</div>
          </div>
          <div>
            <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">JOINING DATE</div>
            <div className="mt-[4px] text-[13.5px]">{formatShortDate(profile.joiningDate)}</div>
          </div>
          <div>
            <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">LENGTH OF SERVICE</div>
            <div className="mt-[4px] text-[13.5px]">{formatLengthOfService(profile.joiningDate)}</div>
          </div>
          <div>
            <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">REPORTING MANAGER</div>
            <div className="mt-[4px] text-[13.5px]">{managerName ?? "—"}</div>
          </div>
          <div>
            <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">LOCATION</div>
            <div className="mt-[4px] text-[13.5px]">Doha, Qatar · Head Office</div>
          </div>
        </div>

        <div className="mt-auto border-t border-line bg-surface px-[24px] py-[14px] text-[12px] text-muted">
          Personal details are maintained by HR. Contact People Ops to request a correction.
        </div>
      </Card>

      <div className="flex flex-col gap-[16px]">
        <Card className="p-[18px]">
          <div className="mb-[12px] text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
            Entitlement
          </div>
          <div className="flex flex-col gap-[9px] text-[13px]">
            <div className="flex justify-between">
              <span className="text-muted">Annual entitlement</span>
              <b>{profile.annualEntitlementDays} days</b>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Current cycle</span>
              <b>
                {balance.isEligible
                  ? formatCycleRange(balance.cycleStart, balance.cycleEnd)
                  : "Not yet eligible"}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">
                {balance.isEligible ? "Next cycle starts" : "Eligible from"}
              </span>
              <b>
                {balance.isEligible
                  ? balance.nextCycleStartsOn
                    ? formatShortDate(balance.nextCycleStartsOn)
                    : "Not due yet"
                  : formatShortDate(balance.cycleStart)}
              </b>
            </div>
            <div className="flex justify-between border-t border-line pt-[10px]">
              <span className="text-muted">Remaining now</span>
              <b>{balance.remaining} days</b>
            </div>
          </div>
        </Card>

        <Card className="flex flex-1 flex-col p-[18px]">
          <div className="mb-[12px] text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
            Unpaid leave, this cycle
          </div>
          <div className="flex items-end gap-[9px]">
            <div className="text-[30px] leading-[0.9] font-semibold tracking-[-0.03em] tabular-nums text-[#4A2E8F]">
              {totalUnpaid}
            </div>
            <div className="pb-[2px] text-[12.5px] text-muted">
              {totalUnpaid === 0
                ? "days taken this cycle"
                : unpaidThisCycle.pending > 0
                  ? "days requested, pending"
                  : "days approved"}
            </div>
          </div>
          <div className="mt-auto pt-[11px] text-[11.5px] leading-relaxed text-muted">
            Unpaid days do not affect your annual balance but are recorded against your service history.
          </div>
        </Card>

        <ChangePasswordCard />
      </div>
    </div>
  );
}
