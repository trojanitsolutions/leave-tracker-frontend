"use client";

import { useMemo, useState } from "react";
import { LoadingState } from "@/components/ui/Spinner";
import { useAdminCalendar, useAdminCalendarYear } from "@/hooks/useAdminCalendar";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useLeaveTypes } from "@/hooks/useLeaveTypes";
import { getLeaveTypeStyle } from "@/lib/leaveTypeStyles";
import { todayUTC } from "@/lib/date";
import { LeaveTypeSummary, TeamCalendarBar, TeamCalendarPerson } from "@/types/domain";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function barStyle(bar: TeamCalendarBar): string {
  const style = getLeaveTypeStyle(bar.leaveTypeId);
  return bar.status === "approved" ? style.barApproved : style.barPending;
}

function buildLegend(leaveTypes: LeaveTypeSummary[]): { label: string; swatch: string }[] {
  return leaveTypes.flatMap((t) => {
    const style = getLeaveTypeStyle(t.id);
    return [
      { label: `${t.name} · approved`, swatch: style.barApproved.split(" ")[0] },
      { label: `${t.name} · pending`, swatch: style.barPending.split(" ")[0] },
    ];
  });
}

/** Days already covered by one of the person's bars, so weekend shading doesn't stack on top of the bar. */
function coveredDaySet(person: TeamCalendarPerson, monthKey: string, daysInMonth: number): Set<number> {
  const covered = new Set<number>();
  for (const bar of person.bars) {
    const barStartsBeforeMonth = bar.startDate.slice(0, 7) < monthKey;
    const barEndsAfterMonth = bar.endDate.slice(0, 7) > monthKey;
    const startDay = barStartsBeforeMonth ? 1 : new Date(bar.startDate).getUTCDate();
    const endDay = barEndsAfterMonth ? daysInMonth : new Date(bar.endDate).getUTCDate();
    for (let day = startDay; day <= endDay; day++) covered.add(day);
  }
  return covered;
}

interface DayMarker {
  status: "none" | "pending" | "approved";
  leaveTypeId: number | null;
}

/** Flattens every person's bars for a month into a per-day marker, colored by leave type — same palette as the month view's bars. */
function computeDayMarkers(
  people: TeamCalendarPerson[] | undefined,
  monthKey: string,
  daysInMonth: number,
): DayMarker[] {
  const markers: DayMarker[] = Array.from({ length: daysInMonth + 1 }, () => ({
    status: "none",
    leaveTypeId: null,
  }));
  for (const person of people ?? []) {
    for (const bar of person.bars) {
      const barStartsBeforeMonth = bar.startDate.slice(0, 7) < monthKey;
      const barEndsAfterMonth = bar.endDate.slice(0, 7) > monthKey;
      const startDay = barStartsBeforeMonth ? 1 : new Date(bar.startDate).getUTCDate();
      const endDay = barEndsAfterMonth ? daysInMonth : new Date(bar.endDate).getUTCDate();
      for (let day = startDay; day <= endDay; day++) {
        if (bar.status === "approved") {
          markers[day] = { status: "approved", leaveTypeId: bar.leaveTypeId };
        } else if (markers[day].status !== "approved") {
          markers[day] = { status: "pending", leaveTypeId: bar.leaveTypeId };
        }
      }
    }
  }
  return markers;
}

function isFriday(year: number, month: number, day: number): boolean {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 5;
}

interface MiniMonthProps {
  year: number;
  month: number; // 1-12
  monthLabel: string;
  people: TeamCalendarPerson[] | undefined;
  today: Date;
  onSelect: () => void;
}

function MiniMonthCalendar({ year, month, monthLabel, people, today, onSelect }: MiniMonthProps) {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leadingBlanks = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const markers = computeDayMarkers(people, monthKey, daysInMonth);
  const todayDay =
    today.getUTCFullYear() === year && today.getUTCMonth() + 1 === month ? today.getUTCDate() : null;

  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-[12px] border border-line bg-card p-[14px] text-left transition-colors hover:border-line-hover hover:bg-surface"
    >
      <div className="mb-[10px] text-[12.5px] font-semibold">{monthLabel}</div>
      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="text-center font-mono text-[9px] text-muted">
            {label}
          </div>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <div key={`blank-${i}`} />
          ) : (
            <div
              key={day}
              className={`relative flex h-[22px] items-center justify-center rounded-[5px] text-[10.5px] ${
                day === todayDay ? "bg-accent font-bold text-white" : isFriday(year, month, day) ? "bg-[#E7E9EC] text-ink" : "text-ink"
              }`}
            >
              {day}
              {markers[day].status !== "none" && day !== todayDay ? (
                <span
                  className="absolute bottom-[1px] h-[5px] w-[5px] rounded-full"
                  style={
                    markers[day].status === "approved"
                      ? { backgroundColor: getLeaveTypeStyle(markers[day].leaveTypeId!).swatch }
                      : {
                          backgroundColor: "transparent",
                          border: `1.5px solid ${getLeaveTypeStyle(markers[day].leaveTypeId!).swatch}`,
                        }
                  }
                />
              ) : null}
            </div>
          ),
        )}
      </div>
    </button>
  );
}

export function AdminCalendarScreen() {
  const today = todayUTC();
  const [viewMode, setViewMode] = useState<"year" | "month">("year");
  const [year, setYear] = useState(today.getUTCFullYear());
  const [month, setMonth] = useState(today.getUTCMonth() + 1);
  const [department, setDepartment] = useState("");
  const { types: leaveTypes } = useLeaveTypes();
  const legend = useMemo(() => buildLegend(leaveTypes), [leaveTypes]);

  const { rows: directoryRows } = useEmployeeDirectory({});
  const departments = useMemo(
    () => [...new Set(directoryRows.map((r) => r.employee.department).filter((d): d is string => Boolean(d)))],
    [directoryRows],
  );

  const label = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
        new Date(Date.UTC(year, month - 1, 1)),
      ),
    [year, month],
  );

  function shiftMonth(delta: number) {
    const d = new Date(Date.UTC(year, month - 1 + delta, 1));
    setYear(d.getUTCFullYear());
    setMonth(d.getUTCMonth() + 1);
  }

  function openMonth(targetMonth: number) {
    setMonth(targetMonth);
    setViewMode("month");
  }

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const { data, isLoading, error } = useAdminCalendar(viewMode === "month", monthKey, department);
  const { data: yearData, isLoading: yearLoading, error: yearError } = useAdminCalendarYear(
    viewMode === "year",
    year,
    department,
  );

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const isWeekend = (day: number) => isFriday(year, month, day);
  const todayInThisMonth =
    today.getUTCFullYear() === year && today.getUTCMonth() + 1 === month ? today.getUTCDate() : null;

  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, i, 1))),
  );

  return (
    <div className="flex w-full flex-col gap-[14px]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-[9px] border border-line bg-card p-[3px]">
          <button
            onClick={() => (viewMode === "year" ? setYear((y) => y - 1) : shiftMonth(-1))}
            className="rounded-[6px] px-[10px] py-[5px] text-[12.5px] text-muted transition-colors hover:bg-surface"
          >
            ‹
          </button>
          <div className="px-3 text-[12.5px] font-semibold">{viewMode === "year" ? year : label}</div>
          <button
            onClick={() => (viewMode === "year" ? setYear((y) => y + 1) : shiftMonth(1))}
            className="rounded-[6px] px-[10px] py-[5px] text-[12.5px] text-muted transition-colors hover:bg-surface"
          >
            ›
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-[9px] border border-line bg-card p-[3px]">
          <button
            onClick={() => setViewMode("year")}
            className={`rounded-[6px] px-[10px] py-[5px] text-[12.5px] font-semibold transition-colors ${
              viewMode === "year" ? "bg-primary text-white" : "text-muted hover:bg-surface"
            }`}
          >
            Year
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`rounded-[6px] px-[10px] py-[5px] text-[12.5px] font-semibold transition-colors ${
              viewMode === "month" ? "bg-primary text-white" : "text-muted hover:bg-surface"
            }`}
          >
            Month
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
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-[7px] text-[11.5px] text-[#4E5359]">
              <span className={`inline-block h-[9px] w-[16px] flex-none rounded-[3px] ${item.swatch}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {viewMode === "year" ? (
        <div className="rounded-[14px] border border-line bg-card p-[18px] shadow-card">
          {yearLoading ? (
            <LoadingState label="Loading the calendar…" />
          ) : yearError ? (
            <div className="px-[20px] py-[24px] text-center text-[12.5px] text-status-rejected-fg">{yearError}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {monthNames.map((monthLabel, i) => (
                  <MiniMonthCalendar
                    key={i}
                    year={year}
                    month={i + 1}
                    monthLabel={monthLabel}
                    people={yearData[i]?.people}
                    today={today}
                    onSelect={() => openMonth(i + 1)}
                  />
                ))}
              </div>
              <div className="mt-[14px] text-[12px] text-muted">
                Friday is shaded as the Qatar weekend. Click a month to see the day-by-day view.
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-line bg-card shadow-card">
          {isLoading ? (
            <LoadingState label="Loading the calendar…" />
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
                    } ${isWeekend(day) ? "bg-[#E7E9EC]" : ""}`}
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
                data?.people.map((person) => {
                  const covered = coveredDaySet(person, monthKey, daysInMonth);
                  return (
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
                        className="relative grid h-[44px] overflow-hidden"
                        style={{ gridColumn: `2 / span ${daysInMonth}`, gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}
                      >
                        {days.map((day) =>
                          isWeekend(day) && !covered.has(day) ? (
                            <div
                              key={day}
                              className="my-auto h-[22px] rounded-[4px] bg-[#E7E9EC]"
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
                              {endDay - startDay >= 2 ? bar.leaveTypeName : ""}
                            </div>
                          );
                        })}
                        {person.bars.length === 0 ? (
                          <div
                            className="col-span-full self-center pl-2 text-[11px] text-[#C9CDD2]"
                            style={{ gridRow: 1 }}
                          >
                            No leave booked
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}

              <div className="flex items-center justify-between px-[18px] py-[12px] text-[12px] text-muted">
                <div>Accent line marks today. Friday is shaded as the Qatar weekend.</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
