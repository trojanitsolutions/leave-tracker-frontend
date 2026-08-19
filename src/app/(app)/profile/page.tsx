"use client";

import Link from "next/link";
import { ProfileScreen } from "@/components/profile/ProfileScreen";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { employee, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-[13px] text-muted">Loading…</div>;
  }

  if (!employee) {
    return (
      <div className="rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
        <div className="text-[15px] font-semibold">Sign in to view your profile</div>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-[8px] bg-primary px-[15px] py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return <ProfileScreen />;
}
