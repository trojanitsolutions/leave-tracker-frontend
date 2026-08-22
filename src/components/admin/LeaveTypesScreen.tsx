"use client";

import { useState } from "react";
import { LeaveTypeFormModal } from "@/components/admin/LeaveTypeFormModal";
import { LoadingState } from "@/components/ui/Spinner";
import { useLeaveTypes } from "@/hooks/useLeaveTypes";
import { apiRequest, ApiClientError } from "@/lib/api";
import { LeaveTypeSummary } from "@/types/domain";

const GRID_COLS = "grid-cols-[1.4fr_0.8fr_1.1fr_1.2fr_0.9fr_auto]";

function entitlementLabel(type: LeaveTypeSummary): string {
  if (!type.isPaid) return "—";
  if (type.code === "annual") return "Set per employee";
  return type.defaultEntitlementDays ? `${type.defaultEntitlementDays} days` : "—";
}

function DeleteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" strokeLinecap="round" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </svg>
  );
}

function StatusPill({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="rounded-full bg-status-approved-bg px-[7px] py-[2px] text-[10.5px] font-medium text-status-approved-fg">
      Active
    </span>
  ) : (
    <span className="rounded-full bg-status-cancelled-bg px-[7px] py-[2px] text-[10.5px] font-medium text-status-cancelled-fg">
      Inactive
    </span>
  );
}

interface RowActionsProps {
  type: LeaveTypeSummary;
  onToggleActive: (type: LeaveTypeSummary) => void;
  onDelete: (type: LeaveTypeSummary) => void;
  onEdit: (type: LeaveTypeSummary) => void;
}

function RowActions({ type, onToggleActive, onDelete, onEdit }: RowActionsProps) {
  return (
    <div className="flex items-center gap-[6px]">
      {!type.isSystem ? (
        <>
          <button
            type="button"
            onClick={() => onToggleActive(type)}
            className="rounded-[7px] border border-line bg-card px-[10px] py-[5px] text-[11.5px] font-medium text-[#4E5359] transition-colors hover:border-line-hover hover:bg-surface"
          >
            {type.isActive ? "Deactivate" : "Reactivate"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(type)}
            aria-label={`Delete ${type.name}`}
            title="Delete"
            className="flex h-[27px] w-[27px] flex-none items-center justify-center rounded-[7px] border border-line bg-card text-status-rejected-fg transition-colors hover:border-status-rejected-fg/40 hover:bg-status-rejected-bg/40"
          >
            <DeleteIcon />
          </button>
        </>
      ) : null}
      <button
        type="button"
        onClick={() => onEdit(type)}
        className="rounded-[7px] border border-line bg-card px-[10px] py-[5px] text-[11.5px] font-medium text-[#4E5359] transition-colors hover:border-line-hover hover:bg-surface"
      >
        Edit
      </button>
    </div>
  );
}

export function LeaveTypesScreen() {
  const { types, isLoading, error, refresh } = useLeaveTypes();
  const [modalState, setModalState] = useState<{ open: boolean; editing: LeaveTypeSummary | null }>({
    open: false,
    editing: null,
  });
  const [actionError, setActionError] = useState<string | null>(null);

  function openAdd() {
    setModalState({ open: true, editing: null });
  }
  function openEdit(type: LeaveTypeSummary) {
    setModalState({ open: true, editing: type });
  }
  function closeModal() {
    setModalState({ open: false, editing: null });
  }
  function handleSaved() {
    closeModal();
    refresh();
  }

  async function toggleActive(type: LeaveTypeSummary) {
    setActionError(null);
    try {
      await apiRequest(`/admin/leave-types/${type.id}/${type.isActive ? "deactivate" : "reactivate"}`, {
        method: "POST",
      });
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : "Couldn't update this leave type.");
    }
  }

  async function deleteType(type: LeaveTypeSummary) {
    setActionError(null);
    if (!window.confirm(`Delete "${type.name}"? This can't be undone.`)) return;
    try {
      await apiRequest(`/admin/leave-types/${type.id}`, { method: "DELETE" });
      refresh();
    } catch (err) {
      // Most likely cause: real leave records already reference this type — the server
      // rejects the delete in that case and says so, so just surface its message directly.
      setActionError(err instanceof ApiClientError ? err.message : "Couldn't delete this leave type.");
    }
  }

  return (
    <div className="flex w-full flex-col gap-[14px]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openAdd}
          className="ml-auto rounded-[8px] border-0 bg-primary px-[14px] py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black"
        >
          Add leave type
        </button>
      </div>

      {actionError ? (
        <div className="rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
          {actionError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-[14px] border border-line bg-card shadow-card">
          <LoadingState label="Loading leave types…" />
        </div>
      ) : error ? (
        <div className="rounded-[14px] border border-line bg-card px-[20px] py-[24px] text-center text-[12.5px] text-status-rejected-fg shadow-card">
          {error}
        </div>
      ) : types.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-card px-[20px] py-[24px] text-center text-[12.5px] text-muted shadow-card">
          No leave types yet.
        </div>
      ) : (
        <>
          {/* Below md: one card per type — the grid table's columns are too cramped to shrink gracefully. */}
          <div className="flex flex-col gap-[10px] md:hidden">
            {types.map((type) => (
              <div key={type.id} className="rounded-[12px] border border-line bg-card p-[14px] shadow-card">
                <div className="flex items-start justify-between gap-[10px]">
                  <div className="flex flex-wrap items-center gap-[6px] text-[13px] font-medium">
                    {type.name}
                    {type.isSystem ? (
                      <span className="rounded-full bg-surface px-[6px] py-[1px] text-[10px] font-semibold text-muted">
                        Built-in
                      </span>
                    ) : null}
                  </div>
                  <StatusPill isActive={type.isActive} />
                </div>

                <div className="mt-[11px] grid grid-cols-3 gap-[10px] text-[12px]">
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.06em] text-muted">PAID</div>
                    <div className="mt-[2px]">{type.isPaid ? "Paid" : "Unpaid"}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.06em] text-muted">ENTITLEMENT</div>
                    <div className="mt-[2px]">{entitlementLabel(type)}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.06em] text-muted">ELIGIBILITY WAIT</div>
                    <div className="mt-[2px]">{type.requiresEligibility ? "Yes" : "No"}</div>
                  </div>
                </div>

                <div className="mt-[12px] border-t border-line pt-[11px]">
                  <RowActions type={type} onToggleActive={toggleActive} onDelete={deleteType} onEdit={openEdit} />
                </div>
              </div>
            ))}
          </div>

          {/* md and up: the full table, horizontally scrollable if the viewport is still narrower than its min-width. */}
          <div className="hidden overflow-x-auto rounded-[14px] border border-line bg-card shadow-card md:block">
            <div
              className={`grid min-w-[820px] ${GRID_COLS} gap-[12px] border-b border-line bg-surface px-[20px] py-[9px] font-mono text-[9.5px] tracking-[0.07em] text-muted`}
            >
              <div>NAME</div>
              <div>PAID</div>
              <div>ENTITLEMENT</div>
              <div>ELIGIBILITY WAIT</div>
              <div>STATUS</div>
              <div />
            </div>

            {types.map((type) => (
              <div
                key={type.id}
                className={`grid min-w-[820px] ${GRID_COLS} items-center gap-[12px] border-b border-[#EFF0F2] px-[20px] py-[12px] transition-colors hover:bg-[#F9FAFB]`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-[6px] truncate text-[12.5px] font-medium">
                    {type.name}
                    {type.isSystem ? (
                      <span className="rounded-full bg-surface px-[6px] py-[1px] text-[10px] font-semibold text-muted">
                        Built-in
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="text-[12.5px]">{type.isPaid ? "Paid" : "Unpaid"}</div>
                <div className="text-[12.5px] tabular-nums">{entitlementLabel(type)}</div>
                <div className="text-[12.5px]">{type.requiresEligibility ? "Yes" : "No"}</div>
                <div>
                  <StatusPill isActive={type.isActive} />
                </div>
                <div className="flex justify-end">
                  <RowActions type={type} onToggleActive={toggleActive} onDelete={deleteType} onEdit={openEdit} />
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between px-[20px] py-[12px] text-[12px] text-muted">
              <div>
                New types are always standalone requests — only the built-in Unpaid Extension type extends an
                existing leave.
              </div>
              <div className="font-mono text-[11px]">
                {types.length} TYPE{types.length === 1 ? "" : "S"}
              </div>
            </div>
          </div>

          <div className="text-[11.5px] text-muted md:hidden">
            New types are always standalone requests — only the built-in Unpaid Extension type extends an existing
            leave.
          </div>
        </>
      )}

      {modalState.open ? (
        <LeaveTypeFormModal editing={modalState.editing} onClose={closeModal} onSaved={handleSaved} />
      ) : null}
    </div>
  );
}
