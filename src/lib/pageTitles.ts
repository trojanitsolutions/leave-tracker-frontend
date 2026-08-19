interface PageTitle {
  title: string;
  subtitle?: string;
}

export const PAGE_TITLES: Record<string, PageTitle> = {
  "/dashboard": { title: "Dashboard", subtitle: "DOHA OFFICE" },
  "/apply": { title: "Apply for annual leave" },
  "/extend": { title: "Request extension" },
  "/my-leave": { title: "My leave" },
  "/history": { title: "Leave history" },
  "/profile": { title: "Profile" },
  "/approvals": { title: "Pending approvals" },
  "/team-calendar": { title: "Team leave calendar" },
  "/team-history": { title: "Team leave history" },
  "/employees": { title: "Employees" },
  "/leave-management": { title: "Leave management" },
  "/leave-calendar": { title: "Leave calendar" },
  "/reports": { title: "Leave reports" },
  "/settings": { title: "Leave settings" },
  "/audit": { title: "Audit history" },
};

export function getPageTitle(pathname: string): PageTitle {
  return PAGE_TITLES[pathname] ?? { title: "Dashboard" };
}
