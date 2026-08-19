"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest, ApiClientError } from "@/lib/api";
import { CompanySettings, EmployeeDirectoryRow, EmployeeProfile, UserRole } from "@/types/domain";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin / HR" },
];

interface EmployeeFormModalProps {
  managers: EmployeeProfile[];
  editing: EmployeeDirectoryRow | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  employeeCode: string;
  fullName: string;
  email: string;
  password: string;
  department: string;
  role: UserRole;
  managerId: string;
  joiningDate: string;
  annualEntitlementDays: string;
  isActive: boolean;
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function initialState(editing: EmployeeDirectoryRow | null): FormState {
  if (!editing) {
    return {
      employeeCode: "",
      fullName: "",
      email: "",
      password: generatePassword(),
      department: "",
      role: "employee",
      managerId: "",
      joiningDate: "",
      annualEntitlementDays: "30",
      isActive: true,
    };
  }
  const { employee } = editing;
  return {
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    email: employee.email,
    password: "",
    department: employee.department ?? "",
    role: employee.role,
    managerId: employee.managerId !== null ? String(employee.managerId) : "",
    joiningDate: employee.joiningDate.slice(0, 10),
    annualEntitlementDays: String(employee.annualEntitlementDays),
    isActive: employee.isActive,
  };
}

export function EmployeeFormModal({ managers, editing, onClose, onSaved }: EmployeeFormModalProps) {
  const [form, setForm] = useState<FormState>(() => initialState(editing));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailFailed, setEmailFailed] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    if (editing) return;
    apiRequest<CompanySettings>("/admin/settings")
      .then((settings) => {
        setForm((prev) =>
          prev.annualEntitlementDays === "30"
            ? { ...prev, annualEntitlementDays: String(settings.defaultAnnualEntitlementDays) }
            : prev,
        );
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      employeeCode: form.employeeCode.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      ...(editing ? {} : { password: form.password }),
      department: form.department.trim() || null,
      role: form.role,
      managerId: form.managerId ? Number(form.managerId) : null,
      joiningDate: form.joiningDate,
      annualEntitlementDays: Number(form.annualEntitlementDays),
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await apiRequest(`/employees/${editing.employee.id}`, { method: "PATCH", body: payload });
        onSaved();
      } else {
        const result = await apiRequest<{ employee: EmployeeProfile; emailSent: boolean }>("/employees", {
          method: "POST",
          body: payload,
        });
        if (result.emailSent) {
          onSaved();
        } else {
          setEmailFailed({ email: form.email.trim(), password: form.password });
        }
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong saving this employee.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(14,15,17,0.42)] p-8"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-full w-full max-w-[640px] overflow-auto rounded-[16px] border border-line bg-card shadow-[0_24px_64px_-24px_rgba(14,15,17,0.45)]"
      >
        <div className="flex items-start gap-4 border-b border-line px-[24px] py-[20px] pb-[16px]">
          <div>
            <div className="text-[17px] font-semibold tracking-[-0.02em]">
              {editing ? "Edit employee" : "Add employee"}
            </div>
            <div className="mt-[3px] text-[12.5px] text-muted">
              {editing
                ? `Editing ${editing.employee.fullName}'s record.`
                : "Creates a new employee record and emails them their sign-in details."}
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

        {emailFailed ? (
          <div className="px-[24px] py-[24px]">
            <div className="text-[14px] font-semibold">Employee created</div>
            <div className="mt-[10px] rounded-[10px] border border-status-pending-fg/25 bg-status-pending-bg/40 px-[14px] py-[12px] text-[12.5px] leading-relaxed text-[#4E5359]">
              The welcome email couldn&rsquo;t be sent to <b>{emailFailed.email}</b>. Share these
              credentials with them directly:
              <div className="mt-[8px] font-mono text-[13px]">
                Email: {emailFailed.email}
                <br />
                Password: {emailFailed.password}
              </div>
            </div>
            <button
              onClick={onSaved}
              className="mt-[18px] rounded-[8px] border-0 bg-primary px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black"
            >
              Done
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-[16px] px-[24px] py-[20px] sm:grid-cols-2">
            <div>
              <div className="mb-[6px] text-[12px] font-medium">Full name</div>
              <input
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="e.g. Sara Darwish"
                className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
              />
            </div>
            <div>
              <div className="mb-[6px] text-[12px] font-medium">Employee ID</div>
              <input
                required
                disabled={Boolean(editing)}
                value={form.employeeCode}
                onChange={(e) => update("employeeCode", e.target.value)}
                placeholder="DOH-0000"
                className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover disabled:bg-surface disabled:text-muted"
              />
            </div>
            <div>
              <div className="mb-[6px] text-[12px] font-medium">Work email</div>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="name@trojantech.qa"
                className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
              />
            </div>
            {editing ? null : (
              <div>
                <div className="mb-[6px] text-[12px] font-medium">Temporary password</div>
                <div className="flex gap-[8px]">
                  <input
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-[9px] border border-line px-3 py-[9px] font-mono text-[13px] transition-colors hover:border-line-hover"
                  />
                  <button
                    type="button"
                    onClick={() => update("password", generatePassword())}
                    className="flex-none rounded-[9px] border border-line bg-card px-[12px] text-[12px] font-medium text-[#4E5359] transition-colors hover:bg-surface"
                  >
                    Generate
                  </button>
                </div>
                <div className="mt-[6px] text-[11px] text-muted">
                  Emailed to the employee automatically. They can change it from their Profile after signing in.
                </div>
              </div>
            )}
            <div>
              <div className="mb-[6px] text-[12px] font-medium">Department</div>
              <input
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
                placeholder="e.g. Operations"
                className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
              />
            </div>
            <div>
              <div className="mb-[6px] text-[12px] font-medium">Reporting manager</div>
              <select
                value={form.managerId}
                onChange={(e) => update("managerId", e.target.value)}
                className="w-full rounded-[9px] border border-line bg-card px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
              >
                <option value="">No manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-[6px] text-[12px] font-medium">Role</div>
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value as UserRole)}
                className="w-full rounded-[9px] border border-line bg-card px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-[6px] text-[12px] font-medium">Joining date</div>
              <input
                required
                type="date"
                value={form.joiningDate}
                onChange={(e) => update("joiningDate", e.target.value)}
                className="w-full rounded-[9px] border border-line px-3 py-[9px] font-mono text-[13px] transition-colors hover:border-line-hover"
              />
            </div>
            <div>
              <div className="mb-[6px] text-[12px] font-medium">Annual entitlement (days)</div>
              <input
                required
                type="number"
                min={0}
                max={365}
                value={form.annualEntitlementDays}
                onChange={(e) => update("annualEntitlementDays", e.target.value)}
                className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
              />
            </div>
            <div>
              <div className="mb-[6px] text-[12px] font-medium">Employment status</div>
              <select
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) => update("isActive", e.target.value === "active")}
                className="w-full rounded-[9px] border border-line bg-card px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {editing ? (
            <div className="mx-[24px] mb-[20px] rounded-[10px] bg-surface px-[14px] py-[12px] text-[12px] leading-relaxed text-[#4E5359]">
              <b className="text-ink">
                {editing.balance.used} days used · {editing.balance.pending} pending ·{" "}
                {editing.balance.remaining} remaining
              </b>{" "}
              in the current cycle. Lowering entitlement below days already taken needs an HR
              correction note (not yet a guided flow — record it in Reason for now).
            </div>
          ) : null}

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
                {isSubmitting ? "Saving…" : editing ? "Save changes" : "Add employee"}
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
