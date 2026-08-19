"use client";

import Link from "next/link";
import { ApplyExtensionForm } from "@/components/extend/ApplyExtensionForm";
import { useAuth } from "@/context/AuthContext";

export default function ExtendPage() {
  const { employee, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-[13px] text-muted">Loading…</div>;
  }

  if (!employee) {
    return (
      <div className="rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
        <div className="text-[15px] font-semibold">Sign in to request an extension</div>
        <div className="mx-auto mt-[8px] max-w-[360px] text-[13px] leading-relaxed text-muted">
          Sign in with your work account first.
        </div>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-[8px] bg-primary px-[15px] py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return <ApplyExtensionForm />;
}
