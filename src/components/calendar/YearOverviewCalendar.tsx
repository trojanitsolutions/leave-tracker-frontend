import { formatRangeLabelUpper, parseISODateOnly } from "@/lib/date";
import { getLeaveTypeStyle } from "@/lib/leaveTypeStyles";
import { TeamCalendarBar, TeamCalendarResult } from "@/types/domain";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface MonthBarSegment {
  startPct: number;
  widthPct: number;
  /** The bar's true total days, regardless of how much of it falls in this month — shown as the label so a split leave always reads as one request. */
  totalDays: number;
  status: "approved" | "pending";
  leaveTypeId: number;
  /** Whether the segment's edge actually starts/ends inside this month, vs. continuing from/into an adjacent month. */
  roundedLeft: boolean;
  roundedRight: boolean;
  /** Tooltip text for the underlying bar, computed from its true unclipped span — same regardless of which month cell you're hovering. */
  tooltip: string;
}

interface MonthCell {
  segments: MonthBarSegment[];
}

/** Positions each bar as a percentage strip of the month's width, clipped at month boundaries — a bar that continues into the next month stays square-edged on that side. */
function computeMonthCell(bars: TeamCalendarBar[], monthKey: string, daysInMonth: number): MonthCell {
  const segments: MonthBarSegment[] = [];

  for (const bar of bars) {
    const barStartsBeforeMonth = bar.startDate.slice(0, 7) < monthKey;
    const barEndsAfterMonth = bar.endDate.slice(0, 7) > monthKey;
    const startDay = barStartsBeforeMonth ? 1 : new Date(bar.startDate).getUTCDate();
    const endDay = barEndsAfterMonth ? daysInMonth : new Date(bar.endDate).getUTCDate();
    const daysThisMonth = endDay - startDay + 1;

    const totalDays =
      Math.round(
        (parseISODateOnly(bar.endDate).getTime() - parseISODateOnly(bar.startDate).getTime()) / MS_PER_DAY,
      ) + 1;
    const tooltip = `${formatRangeLabelUpper(bar.startDate, bar.endDate)} · ${totalDays} day${totalDays === 1 ? "" : "s"} · ${bar.status}`;

    segments.push({
      startPct: ((startDay - 1) / daysInMonth) * 100,
      widthPct: (daysThisMonth / daysInMonth) * 100,
      totalDays,
      status: bar.status === "approved" ? "approved" : "pending",
      leaveTypeId: bar.leaveTypeId,
      roundedLeft: !barStartsBeforeMonth,
      roundedRight: !barEndsAfterMonth,
      tooltip,
    });
  }

  // Approved segments draw last (on top) so a pending sliver under an approved bar doesn't dominate.
  segments.sort((a, b) => Number(a.status === "approved") - Number(b.status === "approved"));

  return { segments };
}

interface PersonYearRow {
  employeeId: number;
  name: string;
  department: string | null;
  /** Index 0 = January … 11 = December. Each month's bars come pre-scoped to that month from the backend. */
  barsByMonth: TeamCalendarBar[][];
}

/** Every person seen across the 12 months, alphabetical, each carrying its own bars per month (a person absent from some months still gets a row). */
function buildPersonRows(yearData: (TeamCalendarResult | null)[]): PersonYearRow[] {
  const byId = new Map<number, PersonYearRow>();
  yearData.forEach((month, i) => {
    for (const person of month?.people ?? []) {
      let row = byId.get(person.employeeId);
      if (!row) {
        row = {
          employeeId: person.employeeId,
          name: person.name,
          department: person.department,
          barsByMonth: Array.from({ length: 12 }, () => []),
        };
        byId.set(person.employeeId, row);
      }
      row.barsByMonth[i] = person.bars;
    }
  });
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

interface YearOverviewCalendarProps {
  year: number;
  yearData: (TeamCalendarResult | null)[];
  onSelectMonth: (month: number) => void;
  emptyLabel: string;
}

export function YearOverviewCalendar({ year, yearData, onSelectMonth, emptyLabel }: YearOverviewCalendarProps) {
  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(year, i, 1))),
  );
  const daysInMonth = (monthIndex0: number) => new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
  const rows = buildPersonRows(yearData);

  if (rows.length === 0) {
    return <div className="px-[20px] py-[24px] text-center text-[12.5px] text-muted">{emptyLabel}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: "760px" }}>
        <div className="grid border-b border-line" style={{ gridTemplateColumns: "200px repeat(12, 1fr)" }}>
          <div className="px-[18px] py-[9px] font-mono text-[9.5px] tracking-[0.07em] text-muted">EMPLOYEE</div>
          {monthLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelectMonth(i + 1)}
              className="border-l border-[#F3F4F5] py-[9px] text-center text-[11px] font-semibold text-muted transition-colors hover:text-ink"
            >
              {label}
            </button>
          ))}
        </div>

        {rows.map((row) => (
          <div
            key={row.employeeId}
            className="grid items-center border-b border-[#EFF0F2] transition-colors hover:bg-[#FAFBFB]"
            style={{ gridTemplateColumns: "200px repeat(12, 1fr)" }}
          >
            <div className="flex min-w-0 items-center gap-[10px] px-[18px] py-[9px]">
              <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-surface text-[10.5px] font-semibold text-[#4E5359]">
                {getInitials(row.name)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-medium">{row.name}</div>
                <div className="text-[10.5px] text-muted">{row.department ?? "—"}</div>
              </div>
            </div>

            {monthLabels.map((_, i) => {
              const monthKey = `${year}-${String(i + 1).padStart(2, "0")}`;
              const cell = computeMonthCell(row.barsByMonth[i], monthKey, daysInMonth(i));

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectMonth(i + 1)}
                  className="relative h-[38px] border-l border-[#F3F4F5] transition-colors hover:bg-surface"
                >
                  {cell.segments.map((seg, si) => {
                    const style = getLeaveTypeStyle(seg.leaveTypeId);
                    const fillClass = seg.status === "approved" ? style.barApproved : style.barPending;
                    return (
                      <span
                        key={si}
                        title={seg.tooltip}
                        className={`absolute inset-y-[8px] flex items-center justify-center text-[9.5px] font-semibold ${fillClass} ${
                          seg.roundedLeft ? "rounded-l-[4px]" : ""
                        } ${seg.roundedRight ? "rounded-r-[4px]" : ""}`}
                        style={{ left: `${seg.startPct}%`, width: `${seg.widthPct}%` }}
                      >
                        {seg.widthPct > 45 ? seg.totalDays : ""}
                      </span>
                    );
                  })}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
