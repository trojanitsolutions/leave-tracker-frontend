"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FullPageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";

export default function RootPage() {
  const { employee, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(employee ? "/dashboard" : "/login");
  }, [isLoading, employee, router]);

  return <FullPageLoader label="Loading…" />;
}
