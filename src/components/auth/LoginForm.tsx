"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { useAuth } from "@/context/AuthContext";
import { ApiClientError } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  async function handleSignIn(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between gap-7 overflow-hidden bg-deep p-12 lg:flex">
        <Image
          src="/login-bg-v3.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-70"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(14,15,17,0.55) 0%, rgba(14,15,17,0.35) 45%, rgba(14,15,17,0.85) 100%)",
          }}
        />
        <div
          className="absolute -top-40 -right-36 h-[520px] w-[520px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(11,150,175,0.28) 0%, rgba(11,150,175,0) 68%)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <Image
            src="/trojan-logo.webp"
            alt="Trojan Technologies"
            width={799}
            height={138}
            className="h-[54px] w-auto brightness-0 invert"
            priority
          />
        </div>
        <div className="relative max-w-[440px]">
          <div className="text-[40px] leading-[1.15] font-semibold tracking-[-0.03em] text-white text-pretty">
            Leave, without the follow-up email.
          </div>
          <div className="mt-3.5 text-[15px] leading-relaxed text-white/58">
            Apply, approve and track return-to-work dates in one place. Balances update the moment
            a manager decides.
          </div>
        </div>
        <div className="relative flex gap-6 font-mono text-[10.5px] tracking-[0.07em] text-white/34">
          <div>DOHA · QATAR</div>
          <div>CYCLE 2026</div>
          <div>v0.1</div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-card px-6 py-16">
        <div className="w-full max-w-[352px]">
          <div className="text-center text-2xl font-semibold  tracking-[-0.025em]">Sign in</div>
          <div className="mt-1.5 text-center text-[13.5px] text-muted">
            {/* Use your work email. Access is provisioned by HR. */}
          </div>

          <form onSubmit={handleSignIn} className="mt-6.5 flex flex-col gap-3.5">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium" htmlFor="email">
                Work email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-[9px] border border-line bg-card px-3.5 py-2.5 text-[13.5px] transition-colors hover:border-line-hover"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label className="text-[12.5px] font-medium" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-accent"
                >
                  Forgot?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-[9px] border border-line bg-card px-3.5 py-2.5 text-[13.5px] tracking-[0.08em] transition-colors hover:border-line-hover"
              />
            </div>

            {error ? (
              <div className="rounded-[9px] border border-status-rejected-fg/20 bg-status-rejected-bg px-3.5 py-2.5 text-[12.5px] text-status-rejected-fg">
                {error}
              </div>
            ) : null}

            <Button type="submit" variant="primary" className="w-full py-2.75" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {/* <div className="mt-5.5 text-[11.5px] leading-relaxed text-muted-2">
            Demo password: <span className="font-mono text-ink">TrojanDemo123!</span> — dev-only,
            removed once HR provisions real accounts.
          </div>
          <div className="mt-2 text-[11.5px] leading-relaxed text-muted-2">
            Trouble signing in? Contact HR on ext. 2210 or hr@trojantech.qa
          </div> */}
        </div>
      </div>

      {showForgotPassword ? (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      ) : null}
    </div>
  );
}
