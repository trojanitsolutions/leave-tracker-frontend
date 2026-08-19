"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { apiRequest, ApiClientError } from "@/lib/api";

type Step = "email" | "otp" | "newPassword" | "done";

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSendCode(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await apiRequest("/auth/forgot-password", { method: "POST", body: { email } });
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await apiRequest<{ resetToken: string }>("/auth/verify-reset-otp", {
        method: "POST",
        body: { email, otp },
      });
      setResetToken(data.resetToken);
      setStep("newPassword");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: { resetToken, newPassword },
      });
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiRequest("/auth/forgot-password", { method: "POST", body: { email } });
    } catch {
      // best-effort — the request itself already showed a generic message on step 1
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(14,15,17,0.42)] p-8">
      <div className="relative w-full max-w-[400px] overflow-auto rounded-[16px] border border-line bg-card p-[28px] shadow-[0_24px_64px_-24px_rgba(14,15,17,0.45)]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-[16px] top-[16px] flex h-7 w-7 flex-none items-center justify-center rounded-[8px] text-[15px] text-muted transition-colors hover:bg-surface"
        >
          ✕
        </button>
        {step === "email" ? (
          <>
            <div className="text-[17px] font-semibold tracking-[-0.02em]">Reset your password</div>
            <div className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Enter your work email and we'll send a 6-digit verification code.
            </div>
            <form onSubmit={handleSendCode} className="mt-5 flex flex-col gap-3.5">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium" htmlFor="reset-email">
                  Work email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[9px] border border-line bg-card px-3.5 py-2.5 text-[13.5px] transition-colors hover:border-line-hover"
                />
              </div>
              {error ? (
                <div className="rounded-[9px] border border-status-rejected-fg/20 bg-status-rejected-bg px-3.5 py-2.5 text-[12.5px] text-status-rejected-fg">
                  {error}
                </div>
              ) : null}
              <Button type="submit" variant="primary" className="w-full py-2.75" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send code"}
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="text-center text-[12.5px] text-muted hover:text-ink"
              >
                Back to sign in
              </button>
            </form>
          </>
        ) : null}

        {step === "otp" ? (
          <>
            <div className="text-[17px] font-semibold tracking-[-0.02em]">Enter your code</div>
            <div className="mt-1.5 text-[13px] leading-relaxed text-muted">
              If an account exists for <span className="font-medium text-ink">{email}</span>, a
              6-digit code was sent. It expires in 10 minutes.
            </div>
            <form onSubmit={handleVerifyOtp} className="mt-5 flex flex-col gap-3.5">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium" htmlFor="reset-otp">
                  Verification code
                </label>
                <input
                  id="reset-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-[9px] border border-line bg-card px-3.5 py-2.5 text-[16px] tracking-[0.3em] transition-colors hover:border-line-hover"
                />
              </div>
              {error ? (
                <div className="rounded-[9px] border border-status-rejected-fg/20 bg-status-rejected-bg px-3.5 py-2.5 text-[12.5px] text-status-rejected-fg">
                  {error}
                </div>
              ) : null}
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.75"
                disabled={isSubmitting || otp.length !== 6}
              >
                {isSubmitting ? "Verifying…" : "Verify code"}
              </Button>
              <div className="flex items-center justify-between text-[12.5px]">
                <button type="button" onClick={() => setStep("email")} className="text-muted hover:text-ink">
                  Change email
                </button>
                <button type="button" onClick={handleResend} disabled={isSubmitting} className="text-accent">
                  Resend code
                </button>
              </div>
            </form>
          </>
        ) : null}

        {step === "newPassword" ? (
          <>
            <div className="text-[17px] font-semibold tracking-[-0.02em]">Set a new password</div>
            <div className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Code verified. Choose a new password for your account.
            </div>
            <form onSubmit={handleResetPassword} className="mt-5 flex flex-col gap-3.5">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium" htmlFor="new-password">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-[9px] border border-line bg-card px-3.5 py-2.5 text-[13.5px] tracking-[0.08em] transition-colors hover:border-line-hover"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium" htmlFor="confirm-password">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-[9px] border border-line bg-card px-3.5 py-2.5 text-[13.5px] tracking-[0.08em] transition-colors hover:border-line-hover"
                />
              </div>
              {error ? (
                <div className="rounded-[9px] border border-status-rejected-fg/20 bg-status-rejected-bg px-3.5 py-2.5 text-[12.5px] text-status-rejected-fg">
                  {error}
                </div>
              ) : null}
              <Button type="submit" variant="primary" className="w-full py-2.75" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Set new password"}
              </Button>
            </form>
          </>
        ) : null}

        {step === "done" ? (
          <>
            <div className="text-[17px] font-semibold tracking-[-0.02em]">Password updated</div>
            <div className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Your password has been changed. Sign in with your new password — you'll be signed out
              of any other devices.
            </div>
            <Button type="button" variant="primary" className="mt-5 w-full py-2.75" onClick={onClose}>
              Back to sign in
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
