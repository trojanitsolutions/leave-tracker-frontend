"use client";

import { FormEvent, useState } from "react";
import { apiRequest, ApiClientError } from "@/lib/api";
import { LeaveTypeSummary } from "@/types/domain";

interface LeaveTypeFormModalProps {
  editing: LeaveTypeSummary | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  name: string;
  isPaid: boolean;
  requiresEligibility: boolean;
  defaultEntitlementDays: string;
}

function initialState(editing: LeaveTypeSummary | null): FormState {
  if (!editing) {
    return { name: "", isPaid: true, requiresEligibility: false, defaultEntitlementDays: "10" };
  }
  return {
    name: editing.name,
    isPaid: editing.isPaid,
    requiresEligibility: editing.requiresEligibility,
    defaultEntitlementDays: editing.defaultEntitlementDays ? String(editing.defaultEntitlementDays) : "",
  };
}

export function LeaveTypeFormModal({ editing, onClose, onSaved }: LeaveTypeFormModalProps) {
  const [form, setForm] = useState<FormState>(() => initialState(editing));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Built-in types (Annual Leave, Unpaid Extension) power the core leave workflow —
  // only their name is editable here; the backend rejects any other field change too.
  const isSystem = editing?.isSystem ?? false;
  const showsAnnualEntitlementNote = isSystem && editing?.code === "annual";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const configPayload = {
      isPaid: form.isPaid,
      requiresEligibility: form.requiresEligibility,
      defaultEntitlementDays: form.isPaid ? Number(form.defaultEntitlementDays) : null,
    };

    try {
      if (editing) {
        const payload = isSystem ? { name: form.name.trim() } : { name: form.name.trim(), ...configPayload };
        await apiRequest(`/admin/leave-types/${editing.id}`, { method: "PATCH", body: payload });
      } else {
        await apiRequest("/admin/leave-types", {
          method: "POST",
          body: { name: form.name.trim(), ...configPayload },
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong saving this leave type.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(14,15,17,0.42)] p-8">
      <div className="w-full max-w-[480px] overflow-auto rounded-[16px] border border-line bg-card shadow-[0_24px_64px_-24px_rgba(14,15,17,0.45)]">
        <div className="flex items-start gap-4 border-b border-line px-[24px] py-[20px] pb-[16px]">
          <div>
            <div className="text-[17px] font-semibold tracking-[-0.02em]">
              {editing ? "Edit leave type" : "Add leave type"}
            </div>
            <div className="mt-[3px] text-[12.5px] text-muted">
              {editing
                ? `Editing ${editing.name}.`
                : "Employees can select this the next time they apply for leave."}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto flex h-7 w-7 flex-none items-center justify-center rounded-[8px] text-[15px] text-muted transition-colors hover:bg-surface"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-[16px] px-[24px] py-[20px]">
            {isSystem ? (
              <div className="rounded-[10px] bg-surface px-[14px] py-[12px] text-[12px] leading-relaxed text-[#4E5359]">
                This is a built-in leave type used by the core leave workflow. Only its name can be
                changed here.
              </div>
            ) : null}

            <div>
              <div className="mb-[6px] text-[12px] font-medium">Name</div>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Sick Leave"
                className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
              />
            </div>

            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <div className="mb-[6px] text-[12px] font-medium">Paid</div>
                <select
                  disabled={isSystem}
                  value={form.isPaid ? "paid" : "unpaid"}
                  onChange={(e) => update("isPaid", e.target.value === "paid")}
                  className="w-full rounded-[9px] border border-line bg-card px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover disabled:bg-surface disabled:text-muted"
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <div>
                <div className="mb-[6px] text-[12px] font-medium">Eligibility wait</div>
                <select
                  disabled={isSystem}
                  value={form.requiresEligibility ? "yes" : "no"}
                  onChange={(e) => update("requiresEligibility", e.target.value === "yes")}
                  className="w-full rounded-[9px] border border-line bg-card px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover disabled:bg-surface disabled:text-muted"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes — 13th month from joining</option>
                </select>
              </div>
            </div>

            {form.isPaid ? (
              <div>
                <div className="mb-[6px] text-[12px] font-medium">Default entitlement (days)</div>
                {showsAnnualEntitlementNote ? (
                  <div className="rounded-[9px] border border-line bg-surface px-3 py-[9px] text-[13px] text-muted">
                    Set per employee on their record, not a single company-wide default.
                  </div>
                ) : (
                  <input
                    required
                    disabled={isSystem}
                    type="number"
                    min={1}
                    max={365}
                    value={form.defaultEntitlementDays}
                    onChange={(e) => update("defaultEntitlementDays", e.target.value)}
                    className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover disabled:bg-surface disabled:text-muted"
                  />
                )}
                <div className="mt-[6px] text-[11px] text-muted">
                  Applies to every employee unless HR sets an individual override.
                </div>
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="mx-[24px] mb-[16px] rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-[10px] rounded-b-[16px] border-t border-line bg-surface px-[24px] py-[14px]">
            <div className="text-[11.5px] text-muted">Changes are recorded in the audit history.</div>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[8px] border border-line bg-card px-[14px] py-2 text-[12.5px] font-medium text-[#4E5359] transition-colors hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[8px] border-0 bg-primary px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? "Saving…" : editing ? "Save changes" : "Add leave type"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
