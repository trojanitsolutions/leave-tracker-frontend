import { AppShell } from "@/components/layout/AppShell";
import { RoleProvider } from "@/context/RoleContext";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AppShell>{children}</AppShell>
    </RoleProvider>
  );
}
