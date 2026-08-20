import { NavItem, UserRole } from "@/types/domain";

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  employee: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Apply for leave", href: "/apply" },
    { label: "Request extension", href: "/extend" },
    { label: "My leave", href: "/my-leave" },
    { label: "Leave history", href: "/history" },
    { label: "Profile", href: "/profile" },
  ],
  manager: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pending approvals", href: "/approvals" },
    { label: "Team leave calendar", href: "/team-calendar" },
    { label: "Team leave history", href: "/team-history" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Employees", href: "/employees" },
    { label: "Leave management", href: "/leave-management" },
    { label: "Leave calendar", href: "/leave-calendar" },
    { label: "Leave reports", href: "/reports" },
    { label: "Leave settings", href: "/settings" },
    { label: "Audit history", href: "/audit" },
  ],
};

export const ROLE_TAGS: Record<UserRole, string> = {
  employee: "EMP",
  manager: "MGR",
  admin: "ADMIN",
};
