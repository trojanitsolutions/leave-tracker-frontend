"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { FullPageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { employee, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && employee) {
      router.replace("/dashboard");
    }
  }, [isLoading, employee, router]);

  // Covers both a fresh session check and the already-signed-in case (e.g. the browser
  // back button returning to /login, or opening the site in a new tab) — never flashes
  // the login form to someone who's still authenticated.
  if (isLoading || employee) {
    return <FullPageLoader label="Loading your workspace…" />;
  }

  return <LoginForm />;
}
