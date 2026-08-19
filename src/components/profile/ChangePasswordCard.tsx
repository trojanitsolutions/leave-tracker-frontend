"use client";

import { FormEvent, useState } from "react";
import { Card } from "@/components/ui/Card";
import { apiRequest, ApiClientError } from "@/lib/api";

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("/auth/change-password", { method: "POST", body: { currentPassword, newPassword } });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't change your password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-[18px]">
      <div className="mb-[12px] text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
        Change password
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-[12px]">
        <div>
          <div className="mb-[6px] text-[12px] font-medium">Current password</div>
          <input
            required
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
          />
        </div>
        <div>
          <div className="mb-[6px] text-[12px] font-medium">New password</div>
          <input
            required
            minLength={8}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
          />
        </div>
        <div>
          <div className="mb-[6px] text-[12px] font-medium">Confirm new password</div>
          <input
            required
            minLength={8}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-[9px] border border-line px-3 py-[9px] text-[13px] transition-colors hover:border-line-hover"
          />
        </div>

        {error ? (
          <div className="rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-[10px] border border-status-approved-fg/25 bg-status-approved-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-approved-fg">
            Password updated.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="self-start rounded-[8px] border-0 bg-primary px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? "Saving…" : "Update password"}
        </button>
      </form>
    </Card>
  );
}
