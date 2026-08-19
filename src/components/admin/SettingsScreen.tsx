"use client";

import { FormEvent, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ApiClientError } from "@/lib/api";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface FormState {
  defaultAnnualEntitlementDays: string;
  eligibilityMonths: string;
  cycleLengthMonths: string;
  backToWorkWatchlistDays: string;
  approachingEligibilityDays: string;
  pendingApprovalAlertDays: string;
}

const ENTITLEMENT_FIELDS: { key: keyof FormState; label: string; hint: string }[] = [
  {
    key: "defaultAnnualEntitlementDays",
    label: "Default annual entitlement (days)",
    hint: "Prefilled when HR adds a new employee. Existing employees keep their individually-set entitlement.",
  },
  {
    key: "eligibilityMonths",
    label: "Eligibility period (months)",
    hint: "Employees become eligible for annual leave this many months after their joining date.",
  },
  {
    key: "cycleLengthMonths",
    label: "Leave cycle length (months)",
    hint: "How often an employee's leave balance resets, anchored to their eligibility date.",
  },
];

const ALERT_FIELDS: { key: keyof FormState; label: string; hint: string }[] = [
  {
    key: "backToWorkWatchlistDays",
    label: "Back-to-work watchlist window (days)",
    hint: "How far ahead the admin dashboard flags employees expected back from leave soon.",
  },
  {
    key: "approachingEligibilityDays",
    label: "Approaching-eligibility window (days)",
    hint: "How far ahead the admin dashboard flags employees nearing their 13th-month eligibility.",
  },
  {
    key: "pendingApprovalAlertDays",
    label: "Pending-approval alert threshold (days)",
    hint: "A pending request older than this is flagged as overdue for a manager decision.",
  },
];

export function SettingsScreen() {
  const { data, isLoading, error, save } = useCompanySettings(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        defaultAnnualEntitlementDays: String(data.defaultAnnualEntitlementDays),
        eligibilityMonths: String(data.eligibilityMonths),
        cycleLengthMonths: String(data.cycleLengthMonths),
        backToWorkWatchlistDays: String(data.backToWorkWatchlistDays),
        approachingEligibilityDays: String(data.approachingEligibilityDays),
        pendingApprovalAlertDays: String(data.pendingApprovalAlertDays),
      });
    }
  }, [data]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      await save({
        defaultAnnualEntitlementDays: Number(form.defaultAnnualEntitlementDays),
        eligibilityMonths: Number(form.eligibilityMonths),
        cycleLengthMonths: Number(form.cycleLengthMonths),
        backToWorkWatchlistDays: Number(form.backToWorkWatchlistDays),
        approachingEligibilityDays: Number(form.approachingEligibilityDays),
        pendingApprovalAlertDays: Number(form.pendingApprovalAlertDays),
      });
      setSavedAt(Date.now());
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Couldn't save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !form) {
    return <div className="text-[13px] text-muted">Loading settings…</div>;
  }

  if (error) {
    return (
      <div className="rounded-[12px] border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-[13px] text-status-rejected-fg">
        Couldn&rsquo;t load company settings: {error}
      </div>
    );
  }

  const currentForm = form;

  function renderFields(fields: { key: keyof FormState; label: string; hint: string }[]) {
    return (
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key}>
            <div className="mb-[6px] text-[12px] font-medium">{field.label}</div>
            <input
              required
              type="number"
              min={1}
              value={currentForm[field.key]}
              onChange={(e) => setForm({ ...currentForm, [field.key]: e.target.value })}
              className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
            />
            <div className="mt-[6px] text-[11.5px] leading-relaxed text-muted">{field.hint}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
      <div className="grid gap-[16px] lg:grid-cols-2">
        <Card className="p-[24px]">
          <div className="mb-[18px]">
            <div className="text-[15px] font-semibold">Entitlement &amp; cycle rules</div>
            <div className="mt-[4px] text-[12.5px] leading-relaxed text-muted">
              Company-wide defaults that drive eligibility and leave-cycle calculations across the
              portal.
            </div>
          </div>
          {renderFields(ENTITLEMENT_FIELDS)}
        </Card>

        <Card className="p-[24px]">
          <div className="mb-[18px]">
            <div className="text-[15px] font-semibold">Dashboard alert thresholds</div>
            <div className="mt-[4px] text-[12.5px] leading-relaxed text-muted">
              Controls how proactively the admin dashboard surfaces upcoming returns, eligibility
              dates, and stale approvals.
            </div>
          </div>
          {renderFields(ALERT_FIELDS)}
        </Card>
      </div>

      {saveError ? (
        <div className="rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
          {saveError}
        </div>
      ) : null}

      <Card className="flex items-center gap-[10px] px-[24px] py-[16px]">
        {savedAt ? <div className="text-[11.5px] text-muted">Saved.</div> : null}
        <button
          type="submit"
          disabled={isSaving}
          className="ml-auto rounded-[8px] border-0 bg-primary px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </Card>
    </form>
  );
}
