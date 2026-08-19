"use client";

import { useMemo, useState } from "react";
import { EmployeeFormModal } from "@/components/admin/EmployeeFormModal";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { formatShortDate } from "@/lib/date";
import { EmployeeDirectoryRow } from "@/types/domain";

const GRID_COLS = "grid-cols-[1.5fr_1fr_1.2fr_0.9fr_1.3fr_0.7fr_auto]";

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EmployeesScreen() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [managerId, setManagerId] = useState("");
  const [modalState, setModalState] = useState<{ open: boolean; editing: EmployeeDirectoryRow | null }>({
    open: false,
    editing: null,
  });

  const filter = useMemo(
    () => ({
      search: search || undefined,
      department: department || undefined,
      managerId: managerId ? Number(managerId) : undefined,
    }),
    [search, department, managerId],
  );

  const { rows, isLoading, error, refresh } = useEmployeeDirectory(filter);
  const { rows: allRows, refresh: refreshAll } = useEmployeeDirectory({});

  const departments = useMemo(
    () => [...new Set(allRows.map((r) => r.employee.department).filter((d): d is string => Boolean(d)))],
    [allRows],
  );
  const managerOptions = useMemo(
    () => allRows.filter((r) => r.employee.role === "manager" && r.employee.isActive).map((r) => r.employee),
    [allRows],
  );

  function openAdd() {
    setModalState({ open: true, editing: null });
  }
  function openEdit(row: EmployeeDirectoryRow) {
    setModalState({ open: true, editing: row });
  }
  function closeModal() {
    setModalState({ open: false, editing: null });
  }
  function handleSaved() {
    closeModal();
    refresh();
    refreshAll();
  }

  return (
    <div className="flex w-full flex-col gap-[14px]">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or employee ID…"
          className="w-[260px] rounded-[9px] border border-line px-[13px] py-2 text-[12.5px] transition-colors hover:border-line-hover"
        />
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
        <select
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
          className="rounded-[8px] border border-line bg-card px-3 py-[7px] text-[12.5px] text-[#4E5359]"
        >
          <option value="">All managers</option>
          {managerOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
        <button
          onClick={openAdd}
          className="ml-auto rounded-[8px] border-0 bg-primary px-[14px] py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black"
        >
          Add employee
        </button>
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-line bg-card shadow-card">
        <div
          className={`grid min-w-[1040px] ${GRID_COLS} gap-[12px] border-b border-line bg-surface px-[20px] py-[9px] font-mono text-[9.5px] tracking-[0.07em] text-muted`}
        >
          <div>EMPLOYEE</div>
          <div>DEPARTMENT</div>
          <div>MANAGER</div>
          <div>JOINED</div>
          <div>BALANCE</div>
          <div>LEFT</div>
          <div />
        </div>

        {isLoading ? (
          <div className="px-[20px] py-[24px] text-center text-[12.5px] text-muted">Loading…</div>
        ) : error ? (
          <div className="px-[20px] py-[24px] text-center text-[12.5px] text-status-rejected-fg">{error}</div>
        ) : rows.length === 0 ? (
          <div className="px-[20px] py-[24px] text-center text-[12.5px] text-muted">
            No employees match these filters.
          </div>
        ) : (
          rows.map((row) => {
            const { employee, managerName, balance } = row;
            const usedPct = balance.entitlement ? (balance.used / balance.entitlement) * 100 : 0;
            const pendingPct = balance.entitlement ? (balance.pending / balance.entitlement) * 100 : 0;
            return (
              <div
                key={employee.id}
                className={`grid min-w-[1040px] ${GRID_COLS} items-center gap-[12px] border-b border-[#EFF0F2] px-[20px] py-[12px] transition-colors hover:bg-[#F9FAFB]`}
              >
                <div className="flex min-w-0 items-center gap-[10px]">
                  <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-surface text-[10.5px] font-semibold text-[#4E5359]">
                    {getInitials(employee.fullName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-[6px] truncate text-[12.5px] font-medium">
                      {employee.fullName}
                      {!employee.isActive ? (
                        <span className="rounded-full bg-status-cancelled-bg px-[6px] py-[1px] text-[10px] font-semibold text-status-cancelled-fg">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                    <div className="font-mono text-[10px] text-muted">{employee.employeeCode}</div>
                  </div>
                </div>
                <div className="text-[12.5px]">{employee.department ?? "—"}</div>
                <div className="text-[12.5px] text-[#4E5359]">{managerName ?? "—"}</div>
                <div className="font-mono text-[11px] text-[#4E5359]">
                  {formatShortDate(employee.joiningDate)}
                </div>
                <div>
                  <div className="flex h-2 overflow-hidden rounded-[4px] bg-line">
                    <div className="bg-primary" style={{ width: `${usedPct}%` }} />
                    <div
                      style={{
                        width: `${pendingPct}%`,
                        background: "repeating-linear-gradient(135deg, #0B96AF 0 3px, #EAF6F9 3px 7px)",
                      }}
                    />
                  </div>
                  <div className="mt-[5px] font-mono text-[10px] text-muted">
                    {balance.used} USED · {balance.pending} PENDING · {balance.entitlement} ENT
                  </div>
                </div>
                <div className="text-[14px] font-semibold tabular-nums">{balance.remaining}</div>
                <div className="flex justify-end">
                  <button
                    onClick={() => openEdit(row)}
                    className="rounded-[7px] border border-line bg-card px-[10px] py-[5px] text-[11.5px] font-medium text-[#4E5359] transition-colors hover:border-line-hover hover:bg-surface"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div className="flex items-center justify-between px-[20px] py-[12px] text-[12px] text-muted">
          <div>Entitlement changes take effect from the next leave cycle unless overridden.</div>
          <div className="font-mono text-[11px]">
            {rows.length} EMPLOYEE{rows.length === 1 ? "" : "S"}
          </div>
        </div>
      </div>

      {modalState.open ? (
        <EmployeeFormModal
          managers={managerOptions}
          editing={modalState.editing}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
