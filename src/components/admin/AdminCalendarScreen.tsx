"use client";

import { useMemo, useState } from "react";
import { useAdminCalendar } from "@/hooks/useAdminCalendar";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { todayUTC } from "@/lib/date";
import { TeamCalendarBar } from "@/types/domain";

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function barStyle(bar: TeamCalendarBar): string {
  if (bar.type === "Unpaid Extension") {
    return bar.status === "approved" ? "bg-[#7C5CD6] text-white" : "bg-[#EDE9FB] text-[#7C5CD6]";
  }
  return bar.status === "approved" ? "bg-primary text-white" : "bg-status-pending-bg text-status-pending-fg";
}

const LEGEND = [
  { label: "Annual Leave · approved", swatch: "bg-primary" },
  { label: "Annual Leave · pending", swatch: "bg-status-pending-bg" },
  { label: "Extension · approved", swatch: "bg-[#7C5CD6]" },
  { label: "Extension · pending", swatch: "bg-[#EDE9FB]" },
];

export function AdminCalendarScreen() {
  const today = todayUTC();
  const [monthOffset, setMonthOffset] = useState(0);
  const [department, setDepartment] = useState("");

  const { rows: directoryRows } = useEmployeeDirectory({});
  const departments = useMemo(
    () => [...new Set(directoryRows.map((r) => r.employee.department).filter((d): d is string => Boolean(d)))],
    [directoryRows],
  );

  const { year, month, label } = useMemo(() => {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset, 1));
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      label: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(d),
    };
  }, [today, monthOffset]);

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const { data, isLoading, error } = useAdminCalendar(true, monthKey, department);

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const isWeekend = (day: number) => {
    const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    return dow === 5 || dow === 6; // Friday, Saturday — Qatar weekend
  };
  const todayInThisMonth =
    today.getUTCFullYear() === year && today.getUTCMonth() + 1 === month ? today.getUTCDate() : null;

  return (
    <div className="flex w-full flex-col gap-[14px]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-[9px] border border-line bg-card p-[3px]">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="rounded-[6px] px-[10px] py-[5px] text-[12.5px] text-muted transition-colors hover:bg-surface"
          >
            ‹
          </button>
          <div className="px-3 text-[12.5px] font-semibold">{label}</div>
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            className="rounded-[6px] px-[10px] py-[5px] text-[12.5px] text-muted transition-colors hover:bg-surface"
          >
            ›
          </button>
        </div>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-[8px] border border-line bg-card px-3 py-[7px] text-[12.5px] text-[#4E5359]"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <div className="ml-auto flex flex-wrap gap-4">
          {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-[7px] text-[11.5px] text-[#4E5359]">
              <span className={`inline-block h-[9px] w-[16px] flex-none rounded-[3px] ${item.swatch}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-line bg-card shadow-card">
        {isLoading ? (
          <div className="px-[20px] py-[24px] text-center text-[12.5px] text-muted">Loading…</div>
        ) : error ? (
          <div className="px-[20px] py-[24px] text-center text-[12.5px] text-status-rejected-fg">{error}</div>
        ) : (
          <div style={{ minWidth: `${200 + daysInMonth * 26}px` }}>
            <div className="grid border-b border-line bg-surface" style={{ gridTemplateColumns: `200px repeat(${daysInMonth}, 1fr)` }}>
              <div className="px-[18px] py-[9px] font-mono text-[9.5px] tracking-[0.07em] text-muted">
                EMPLOYEE
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className={`py-[9px] text-center font-mono text-[9.5px] ${
                    day === todayInThisMonth ? "font-bold text-accent" : "text-muted"
                  } ${isWeekend(day) ? "bg-[#FAFBFB]" : ""}`}
                >
                  {day}
                </div>
              ))}
            </div>

            {(data?.people ?? []).length === 0 ? (
              <div className="px-[20px] py-[24px] text-center text-[12.5px] text-muted">
                No employees match these filters.
              </div>
            ) : (
              data?.people.map((person) => (
                <div
                  key={person.employeeId}
                  className="grid items-center border-b border-[#EFF0F2] transition-colors hover:bg-[#FAFBFB]"
                  style={{ gridTemplateColumns: `200px repeat(${daysInMonth}, 1fr)` }}
                >
                  <div className="flex min-w-0 items-center gap-[10px] px-[18px] py-[9px]">
                    <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-surface text-[10.5px] font-semibold text-[#4E5359]">
                      {getInitials(person.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[12.5px] font-medium">{person.name}</div>
                      <div className="text-[10.5px] text-muted">{person.department ?? "—"}</div>
                    </div>
                  </div>
                  <div
                    className="relative grid h-[44px]"
                    style={{ gridColumn: `2 / span ${daysInMonth}`, gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}
                  >
                    {days.map((day) =>
                      isWeekend(day) ? (
                        <div
                          key={day}
                          className="bg-[#FAFBFB]"
                          style={{ gridColumn: `${day} / span 1`, gridRow: 1 }}
                        />
                      ) : null,
                    )}
                    {todayInThisMonth ? (
                      <div
                        className="bg-accent/[0.55]"
                        style={{ gridColumn: `${todayInThisMonth} / span 1`, gridRow: 1, width: "1.5px", justifySelf: "start" }}
                      />
                    ) : null}
                    {person.bars.map((bar, i) => {
                      const start = Math.max(1, new Date(bar.startDate).getUTCDate());
                      const barStartsBeforeMonth = bar.startDate.slice(0, 7) < monthKey;
                      const barEndsAfterMonth = bar.endDate.slice(0, 7) > monthKey;
                      const startDay = barStartsBeforeMonth ? 1 : start;
                      const endDay = barEndsAfterMonth ? daysInMonth : new Date(bar.endDate).getUTCDate();
                      return (
                        <div
                          key={i}
                          className={`z-10 my-auto flex h-[22px] items-center overflow-hidden rounded-[6px] px-2 text-[10.5px] font-semibold whitespace-nowrap ${barStyle(bar)}`}
                          style={{ gridColumn: `${startDay} / ${endDay + 1}`, gridRow: 1 }}
                        >
                          {endDay - startDay >= 2 ? bar.type : ""}
                        </div>
                      );
                    })}
                    {person.bars.length === 0 ? (
                      <div className="col-span-full self-center pl-2 text-[11px] text-[#C9CDD2]">
                        No leave booked
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}

            <div className="flex items-center justify-between px-[18px] py-[12px] text-[12px] text-muted">
              <div>Accent line marks today. Friday and Saturday are shaded as the Qatar weekend.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
