"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/Spinner";
import { useAdminReports } from "@/hooks/useAdminReports";
import { getLeaveTypeStyle } from "@/lib/leaveTypeStyles";
import { AdminReportsResult } from "@/types/domain";

const CURRENT_YEAR = new Date().getFullYear();

function formatNameList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function topMonthsNote(monthly: AdminReportsResult["monthly"]): string | null {
  const total = monthly.reduce((sum, m) => sum + m.days, 0);
  if (total === 0) return null;
  const sorted = [...monthly].filter((m) => m.days > 0).sort((a, b) => b.days - a.days);
  if (sorted.length === 0) return null;
  const top = sorted.slice(0, 2);
  const topDays = top.reduce((sum, m) => sum + m.days, 0);
  const percent = Math.round((topDays / total) * 100);
  const labels = top.map((m) => m.label[0] + m.label.slice(1).toLowerCase());
  return `Cover risk concentrates in ${formatNameList(labels)}, when ${percent}% of the cycle's leave is taken.`;
}

function leaveTypeSplitNote(
  leaveTypeSplit: AdminReportsResult["leaveTypeSplit"],
  totalHeadcount: number,
): string | null {
  const total = leaveTypeSplit.reduce((sum, t) => sum + t.days, 0);
  if (total === 0 || totalHeadcount === 0) return null;
  const dominant = [...leaveTypeSplit].sort((a, b) => b.days - a.days)[0];
  const perEmployee = Math.round((total / totalHeadcount) * 10) / 10;
  return `${dominant.leaveTypeName} makes up ${dominant.percent}% of all leave taken this cycle — an average of ${perEmployee} days per employee across all leave types.`;
}

export function ReportsScreen() {
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [department, setDepartment] = useState("");

  const { data, isLoading, error } = useAdminReports(true, year, department || undefined);

  const monthNote = useMemo(() => (data ? topMonthsNote(data.monthly) : null), [data]);
  const totalHeadcount = useMemo(
    () => (data ? data.departmentTable.reduce((sum, d) => sum + d.headcount, 0) : 0),
    [data],
  );
  const splitNote = useMemo(
    () => (data ? leaveTypeSplitNote(data.leaveTypeSplit, totalHeadcount) : null),
    [data, totalHeadcount],
  );

  if (isLoading || !data) {
    return <LoadingState label="Loading reports…" />;
  }

  if (error) {
    return (
      <div className="rounded-[12px] border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-[13px] text-status-rejected-fg">
        Couldn&rsquo;t load reports: {error}
      </div>
    );
  }

  const { stats } = data;
  const entitlementUsedPercent =
    stats.avgEntitlement > 0 ? Math.round((stats.avgPerEmployee / stats.avgEntitlement) * 100) : 0;
  const maxMonthDays = Math.max(1, ...data.monthly.map((m) => m.days));

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-[2px] rounded-[9px] border border-line bg-card p-[3px]">
          {[CURRENT_YEAR, CURRENT_YEAR - 1].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`rounded-[7px] px-3 py-[6px] text-[12.5px] font-semibold transition-colors ${
                year === y ? "bg-primary text-white" : "text-[#4E5359] hover:bg-surface"
              }`}
            >
              Cycle {y}
            </button>
          ))}
        </div>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-[8px] border border-line bg-card px-3 py-[7px] text-[12.5px] text-[#4E5359]"
        >
          <option value="">All departments</option>
          {data.departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-[12px] lg:grid-cols-4">
        <Card className="px-[16px] py-[14px]">
          <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">DAYS TAKEN, {data.cycleLabel.toUpperCase()}</div>
          <div className="mt-1 flex items-end gap-2">
            <div className="text-[26px] font-semibold tabular-nums leading-none">{stats.daysTakenYtd}</div>
            {stats.daysTakenPriorPeriod > 0 ? (
              <div
                className={`pb-[2px] text-[11.5px] font-semibold ${
                  stats.deltaPercent >= 0 ? "text-accent" : "text-status-rejected-fg"
                }`}
              >
                {stats.deltaPercent >= 0 ? "+" : ""}
                {stats.deltaPercent}%
              </div>
            ) : null}
          </div>
          <div className="mt-[6px] text-[11.5px] leading-relaxed text-muted">
            {stats.daysTakenPriorPeriod > 0
              ? `Against ${stats.daysTakenPriorPeriod} at this point last cycle.`
              : "No comparable data for the prior cycle yet."}
          </div>
        </Card>

        <Card className="px-[16px] py-[14px]">
          <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">AVG PER EMPLOYEE</div>
          <div className="mt-1 flex items-end gap-2">
            <div className="text-[26px] font-semibold tabular-nums leading-none">{stats.avgPerEmployee}</div>
            <div className="pb-[2px] text-[11.5px] font-semibold text-muted">of {stats.avgEntitlement}</div>
          </div>
          <div className="mt-[6px] text-[11.5px] leading-relaxed text-muted">
            {entitlementUsedPercent}% of entitlement used on average.
          </div>
        </Card>

        <Card className="border-[#FCD9A6] bg-[#FFFBF3] px-[16px] py-[14px]">
          <div className="font-mono text-[9.5px] tracking-[0.07em] text-[#92400E]">OVERDUE RETURNS</div>
          <div className="mt-1 flex items-end gap-2">
            <div className="text-[26px] font-semibold tabular-nums leading-none text-[#92400E]">
              {stats.overdueCount}
            </div>
            {stats.overdueCount > 0 ? (
              <div className="pb-[2px] text-[11.5px] font-semibold text-[#92400E]">open</div>
            ) : null}
          </div>
          <div className="mt-[6px] text-[11.5px] leading-relaxed text-[#92400E]/80">
            {stats.overdueCount > 0 ? `${formatNameList(stats.overdueNames)}.` : "No overdue returns right now."}
          </div>
        </Card>

        <Card className="border-[#DCD3F5] bg-[#F8F6FD] px-[16px] py-[14px]">
          <div className="font-mono text-[9.5px] tracking-[0.07em] text-[#4A2E8F]">UNPAID DAYS</div>
          <div className="mt-1 flex items-end gap-2">
            <div className="text-[26px] font-semibold tabular-nums leading-none text-[#4A2E8F]">
              {stats.unpaidDays}
            </div>
            {stats.unpaidPendingCount > 0 ? (
              <div className="pb-[2px] text-[11.5px] font-semibold text-[#4A2E8F]">
                {stats.unpaidPendingCount} pending
              </div>
            ) : null}
          </div>
          <div className="mt-[6px] text-[11.5px] leading-relaxed text-[#4A2E8F]/80">
            Recorded across {stats.unpaidApprovedCount} extension request{stats.unpaidApprovedCount === 1 ? "" : "s"}.
          </div>
        </Card>
      </div>

      <div className="grid gap-[16px] lg:grid-cols-[1.6fr_1fr]">
        <Card className="flex flex-col p-[20px]">
          <div className="flex items-baseline justify-between">
            <div className="text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">Days taken by month</div>
            <div className="font-mono text-[10.5px] text-muted">{data.cycleLabel.toUpperCase()}</div>
          </div>
          <div className="mt-[20px] grid grid-cols-12 items-end gap-[8px]" style={{ height: 196 }}>
            {data.monthly.map((m) => (
              <div key={m.label} className="flex h-full flex-col justify-end gap-[6px]">
                <div className="text-center font-mono text-[9.5px] text-muted">{m.days}</div>
                <div
                  className={`w-full rounded-t-[5px] ${m.days > maxMonthDays * 0.7 ? "bg-accent" : "bg-primary"}`}
                  style={{ height: `${m.heightPercent}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-[8px] grid grid-cols-12 gap-[8px] border-t border-line pt-[8px]">
            {data.monthly.map((m) => (
              <div
                key={m.label}
                className={`text-center font-mono text-[9px] tracking-[0.04em] ${
                  m.days > maxMonthDays * 0.7 ? "text-accent" : "text-muted"
                }`}
              >
                {m.label}
              </div>
            ))}
          </div>
          {monthNote ? (
            <div className="mt-auto pt-[16px] text-[12px] leading-relaxed text-[#4E5359]">{monthNote}</div>
          ) : null}
        </Card>

        <Card className="flex flex-col p-[20px]">
          <div className="text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">Leave type split</div>
          <div className="mt-[16px] flex h-[14px] overflow-hidden rounded-[7px]">
            {data.leaveTypeSplit.map((t) => (
              <div
                key={t.leaveTypeId}
                style={{
                  width: `${t.percent}%`,
                  background: getLeaveTypeStyle(t.leaveTypeId).swatch,
                }}
              />
            ))}
          </div>
          <div className="mt-[16px] flex flex-col gap-[11px]">
            {data.leaveTypeSplit.map((t) => (
              <div key={t.leaveTypeId} className="flex items-center gap-[9px]">
                <span
                  className="h-[9px] w-[9px] flex-none rounded-[3px]"
                  style={{ background: getLeaveTypeStyle(t.leaveTypeId).swatch }}
                />
                <span className="text-[12.5px] text-[#4E5359]">{t.leaveTypeName}</span>
                <span className="ml-auto text-[12.5px] font-semibold tabular-nums">{t.days} days</span>
                <span className="w-[44px] text-right font-mono text-[10.5px] text-muted">{t.percent}%</span>
              </div>
            ))}
          </div>
          {splitNote ? (
            <div className="mt-auto pt-[16px] text-[12px] leading-relaxed text-[#4E5359]">{splitNote}</div>
          ) : null}
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <div className="flex items-center justify-between px-[20px] pt-[15px] pb-[13px]">
          <div className="text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">By department</div>
          <div className="text-[12px] text-muted">
            {data.departmentTable.length} department{data.departmentTable.length === 1 ? "" : "s"} · {totalHeadcount}{" "}
            employees
          </div>
        </div>
        <div className="grid min-w-[900px] grid-cols-[1.3fr_0.7fr_0.8fr_1.6fr_0.9fr_0.9fr] gap-[12px] border-y border-line bg-surface px-[20px] py-[9px] font-mono text-[9.5px] tracking-[0.07em] text-muted">
          <div>DEPARTMENT</div>
          <div>HEADCOUNT</div>
          <div>DAYS TAKEN</div>
          <div>UTILISATION</div>
          <div>PENDING</div>
          <div className="text-right">LIABILITY</div>
        </div>
        {data.departmentTable.length === 0 ? (
          <div className="px-[20px] py-[16px] text-[12.5px] text-muted">No department data yet.</div>
        ) : (
          data.departmentTable.map((d) => (
            <div
              key={d.name}
              className="grid min-w-[900px] grid-cols-[1.3fr_0.7fr_0.8fr_1.6fr_0.9fr_0.9fr] items-center gap-[12px] border-b border-line/60 px-[20px] py-[12px] transition-colors hover:bg-surface"
            >
              <div className="text-[12.5px] font-medium">{d.name}</div>
              <div className="text-[12.5px] tabular-nums text-[#4E5359]">{d.headcount}</div>
              <div className="text-[12.5px] tabular-nums">{d.daysTaken}</div>
              <div className="flex items-center gap-[10px]">
                <div className="h-[8px] flex-1 overflow-hidden rounded-[4px] bg-[#E3E5E8]">
                  <div
                    className={`h-full ${d.utilizationPercent >= 70 ? "bg-accent" : "bg-primary"}`}
                    style={{ width: `${Math.min(100, d.utilizationPercent)}%` }}
                  />
                </div>
                <span className="w-[34px] text-right font-mono text-[10.5px] text-muted">
                  {d.utilizationPercent}%
                </span>
              </div>
              <div className="text-[12.5px] font-semibold tabular-nums text-accent">{d.pending}</div>
              <div className="text-right text-[12.5px] font-semibold tabular-nums">{d.liabilityDays} d</div>
            </div>
          ))
        )}
        <div className="flex min-w-[900px] items-center justify-between px-[20px] py-[12px] text-[12px] text-muted">
          <div>Liability is unused entitlement carried at current headcount.</div>
          <div className="font-mono text-[11px]">TOTAL {data.totalLiabilityDays} DAYS</div>
        </div>
      </Card>
    </div>
  );
}
