import {
  BackToWorkRow,
  CurrentUser,
  DepartmentLoad,
  EligibilityItem,
  NavItem,
  OnLeaveRow,
  QueueItem,
  RecentLeaveRow,
  UserRole,
} from "@/types/domain";

/**
 * Placeholder data standing in for the API. Every value here is replaced once
 * the corresponding backend endpoint (see backend/src) is implemented.
 */

export const MOCK_USERS: Record<UserRole, CurrentUser> = {
  employee: {
    id: "emp-1",
    fullName: "Ahmed Al-Sulaiti",
    initials: "AS",
    employeeCode: "DOH-0417",
    role: "employee",
    department: "Operations",
    roleTag: "EMP",
  },
  manager: {
    id: "emp-2",
    fullName: "Fatima Al-Kuwari",
    initials: "FK",
    employeeCode: "DOH-0102",
    role: "manager",
    department: "Operations",
    roleTag: "MGR",
  },
  admin: {
    id: "emp-3",
    fullName: "Layla Al-Emadi",
    initials: "LA",
    employeeCode: "DOH-0009",
    role: "admin",
    department: "Human Resources",
    roleTag: "ADMIN",
  },
};

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
    { label: "Pending approvals", href: "/approvals", badge: 2 },
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

export const EMPLOYEE_LEAVE_BALANCE = {
  cycleLabel: "CYCLE 01 JAN – 31 DEC 2026",
  entitlement: 30,
  used: 20,
  pending: 5,
  remaining: 5,
  nextEligibility: "01 Jan 2027",
};

export const EMPLOYEE_ON_LEAVE = {
  isOnLeave: true,
  dayNumber: 12,
  totalDays: 20,
  expectedBackToWork: "Fri 21 Aug 2026",
  progressPercent: 60,
};

export const EMPLOYEE_RECENT_REQUESTS: RecentLeaveRow[] = [
  {
    id: "lr-1",
    type: "Annual Leave",
    dates: "01 AUG → 20 AUG 2026",
    days: 20,
    backToWork: "21 Aug 2026",
    status: "approved",
  },
  {
    id: "ext-1",
    type: "Unpaid Extension",
    dates: "21 AUG → 03 SEP 2026",
    days: 14,
    backToWork: "04 Sep 2026",
    status: "pending",
    isChild: true,
  },
  {
    id: "lr-2",
    type: "Annual Leave",
    dates: "05 OCT → 09 OCT 2026",
    days: 5,
    backToWork: "10 Oct 2026",
    status: "pending",
  },
];

export const MANAGER_SUMMARY = {
  managerName: "Fatima Al-Kuwari",
  managerRole: "Your manager · Operations",
  pendingCount: 2,
  oldestPendingDays: 3,
};

export const MANAGER_QUEUE_STATS = {
  awaitingYou: 2,
  oldestInQueueDays: 3,
  teamOutNextWeek: 3,
  teamSize: 11,
  notReturnedAsExpected: 1,
};

export const MANAGER_OVERVIEW_STATS = {
  teamSize: 11,
  currentlyOnLeave: 2,
  pendingApprovals: 2,
  teamOutNextWeek: 3,
  notReturnedAsExpected: 1,
};

export const MANAGER_ON_LEAVE: OnLeaveRow[] = [
  {
    id: "ol-1",
    initials: "SN",
    name: "Sara Al-Naimi",
    department: "Operations",
    type: "Unpaid Extension",
    dates: "04 SEP → 11 SEP 2026",
    backToWork: "12 Sep 2026",
  },
  {
    id: "ol-2",
    initials: "YT",
    name: "Yousef Tariq",
    department: "Operations",
    type: "Annual Leave",
    dates: "10 AUG → 17 AUG 2026",
    backToWork: "18 Aug 2026",
  },
];

export const MANAGER_QUEUE: QueueItem[] = [
  {
    id: "q-1",
    initials: "OK",
    name: "Omar Al-Kubaisi",
    roleLine: "Sales Executive · Operations",
    type: "Annual Leave",
    dates: "20 AUG → 24 AUG 2026",
    days: 5,
    balanceAfterLabel: "9 remaining",
    reason: "Family travel to Muscat, handover shared with Noor.",
    cover: "Noor Al-Sayed covering handover for the duration.",
    backToWork: "25 Aug 2026",
    balUsedPct: 55,
    balPendingPct: 15,
    balanceDetail: "14 used, 2 pending elsewhere, 9 left of 25 entitlement.",
    status: "pending",
  },
  {
    id: "q-2",
    initials: "KM",
    name: "Khalid Al-Marri",
    roleLine: "Warehouse Supervisor · Operations",
    type: "Annual Leave",
    dates: "01 OCT → 09 OCT 2026",
    days: 7,
    balanceAfterLabel: "-2 remaining",
    balanceIsNegative: true,
    reason: "Annual trip, flights already booked.",
    cover: "On-call rota handed to Youssef for the period.",
    backToWork: "10 Oct 2026",
    balUsedPct: 90,
    balPendingPct: 12,
    balanceDetail: "20 used, 7 requested — 2 days over his 25-day entitlement.",
    status: "pending",
  },
  {
    id: "q-3",
    initials: "SN",
    name: "Sara Al-Naimi",
    roleLine: "Customer Success · Operations",
    type: "Unpaid Extension",
    dates: "04 SEP → 11 SEP 2026",
    days: 7,
    balanceAfterLabel: "unaffected",
    reason: "Flight rescheduled, needs an extra week before returning.",
    cover: "Ali covering client calls until she's back.",
    backToWork: "12 Sep 2026",
    balUsedPct: 60,
    balPendingPct: 10,
    balanceDetail: "Unpaid extension — annual balance is not touched.",
    status: "approved",
  },
];

export const ADMIN_STATS = {
  totalEmployees: 50,
  departmentCount: 6,
  currentlyOnLeave: 12,
  upcomingThisMonth: 27,
  notReturnedAsExpected: 2,
  pendingApprovals: 9,
  pendingOver3DaysOld: 4,
  pendingUnpaidExtensions: 3,
  pendingApproachingEligibility: 6,
};

export const ADMIN_BACK_TO_WORK_ROWS: BackToWorkRow[] = [
  {
    id: "btw-1",
    initials: "AS",
    name: "Ahmed Al-Sulaiti",
    department: "Operations",
    expectedBackToWork: "21 Aug 2026",
    actualBackToWork: null,
    status: "Upcoming",
  },
  {
    id: "btw-2",
    initials: "MK",
    name: "Mariam Al-Kaabi",
    department: "Finance",
    expectedBackToWork: "15 Aug 2026",
    actualBackToWork: "15 Aug 2026",
    status: "Returned",
  },
  {
    id: "btw-3",
    initials: "YS",
    name: "Yousuf Al-Sayed",
    department: "IT",
    expectedBackToWork: "10 Aug 2026",
    actualBackToWork: null,
    status: "Overdue",
  },
  {
    id: "btw-4",
    initials: "NS",
    name: "Noor Al-Sayed",
    department: "Operations",
    expectedBackToWork: "12 Aug 2026",
    actualBackToWork: null,
    status: "Overdue",
  },
];

export const ADMIN_ELIGIBILITY: EligibilityItem[] = [
  { id: "el-1", initials: "HE", name: "Hassan Al-Emadi", joinedLabel: "15 SEP 2025", daysUntilEligible: 33 },
  { id: "el-2", initials: "RA", name: "Reem Al-Ansari", joinedLabel: "02 OCT 2025", daysUntilEligible: 50 },
  { id: "el-3", initials: "FK", name: "Faisal Al-Kubaisi", joinedLabel: "20 OCT 2025", daysUntilEligible: 68 },
];

export const ADMIN_DEPT_LOAD: DepartmentLoad[] = [
  { id: "dept-1", name: "Operations", onLeave: 8, headcount: 20 },
  { id: "dept-2", name: "Sales", onLeave: 5, headcount: 12 },
  { id: "dept-3", name: "IT", onLeave: 3, headcount: 9 },
  { id: "dept-4", name: "Finance", onLeave: 2, headcount: 9 },
];
