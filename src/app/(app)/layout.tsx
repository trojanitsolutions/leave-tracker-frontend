"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { FullPageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { RoleProvider } from "@/context/RoleContext";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { employee, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !employee) {
      router.replace("/login");
    }
  }, [isLoading, employee, router]);

  // Blocks the whole shell (sidebar identity/nav included) until the real
  // session resolves — no route in this group renders with a guessed role.
  if (isLoading || !employee) {
    return <FullPageLoader label="Loading your workspace…" />;
  }

  return (
    <RoleProvider>
      <AppShell>{children}</AppShell>
    </RoleProvider>
  );
}
