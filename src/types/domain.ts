export type UserRole = "employee" | "manager" | "admin";

export type LeaveDecisionStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface CurrentUser {
  id: string;
  fullName: string;
  initials: string;
  employeeCode: string;
  role: UserRole;
  department: string;
  roleTag: string;
}

export interface NavItem {
  label: string;
  href: string;
  badge?: number;
}

export interface RecentLeaveRow {
  id: string;
  type: string;
  dates: string;
  days: number;
  backToWork: string;
  status: LeaveDecisionStatus;
  isChild?: boolean;
}

export type QueueDecisionStatus = "pending" | "approved" | "rejected";

export interface QueueItem {
  id: string;
  initials: string;
  name: string;
  roleLine: string;
  type: "Annual Leave" | "Unpaid Extension";
  dates: string;
  days: number;
  balanceAfterLabel: string;
  balanceIsNegative?: boolean;
  reason: string;
  attachment?: string;
  cover: string;
  backToWork: string;
  balUsedPct: number;
  balPendingPct: number;
  balanceDetail: string;
  status: QueueDecisionStatus;
}

export interface BackToWorkRow {
  id: string;
  initials: string;
  name: string;
  department: string;
  expectedBackToWork: string;
  actualBackToWork: string | null;
  status: "Returned" | "Upcoming" | "Overdue";
}

export interface EligibilityItem {
  id: string;
  initials: string;
  name: string;
  joinedLabel: string;
  daysUntilEligible: number;
}

export interface DepartmentLoad {
  id: string;
  name: string;
  onLeave: number;
  headcount: number;
}

export interface OnLeaveRow {
  id: string;
  initials: string;
  name: string;
  department: string;
  type: "Annual Leave" | "Unpaid Extension";
  dates: string;
  backToWork: string;
}

// --- Real API shapes (mirrors backend/src/types/entities.ts + leave.ts) ---

export type EmployeeLeaveStatus = "not_on_leave" | "on_annual_leave" | "on_unpaid_extension" | "returned";

export interface EmployeeProfile {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  department: string | null;
  role: UserRole;
  managerId: number | null;
  joiningDate: string;
  annualEntitlementDays: number;
  isActive: boolean;
}

export interface LeaveRequestRecord {
  id: number;
  employeeId: number;
  managerId: number;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string | null;
  attachmentUrl: string | null;
  status: LeaveDecisionStatus;
  expectedBackToWorkDate: string;
  actualBackToWorkDate: string | null;
  submittedAt: string;
  decidedAt: string | null;
}

export interface LeaveBalance {
  isEligible: boolean;
  cycleStart: string;
  cycleEnd: string;
  entitlement: number;
  used: number;
  pending: number;
  remaining: number;
  nextCycleStartsOn: string | null;
}

export interface LeaveExtensionRecord {
  id: number;
  leaveRequestId: number;
  employeeId: number;
  managerId: number;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string | null;
  attachmentUrl: string | null;
  status: LeaveDecisionStatus;
  submittedAt: string;
  decidedAt: string | null;
}

export interface LeaveHistoryEntry {
  id: number;
  kind: "leave" | "extension";
  parentLeaveRequestId: number | null;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: LeaveDecisionStatus;
  backToWorkDate: string;
  actualBackToWorkDate: string | null;
  submittedAt: string;
  decidedAt: string | null;
}

export interface EmployeeOverview {
  employee: EmployeeProfile;
  managerName: string | null;
  managerDepartment: string | null;
  status: EmployeeLeaveStatus;
  currentLeave: LeaveRequestRecord | null;
  currentExtension: LeaveExtensionRecord | null;
  balance: LeaveBalance;
  recent: LeaveHistoryEntry[];
}

export type ApplyCheckKey = "eligibility" | "balance" | "overlap";

export interface ApplyCheckItem {
  key: ApplyCheckKey;
  ok: boolean;
  title: string;
  body: string;
}

export interface TeamOverlapEntry {
  employeeId: number;
  name: string;
  dates: string;
}

export interface BalanceProjection {
  entitlement: number;
  used: number;
  pending: number;
  thisRequest: number;
  remainingAfter: number;
}

export interface ApplyPrecheckResult {
  days: number;
  checks: ApplyCheckItem[];
  canSubmit: boolean;
  balanceAfter: BalanceProjection;
  teamOverlap: TeamOverlapEntry[];
}

export type ExtensionCheckKey = "onLeave" | "contiguous" | "overlap";

export interface ExtensionCheckItem {
  key: ExtensionCheckKey;
  ok: boolean;
  title: string;
  body: string;
}

export interface ExtensionPrecheckResult {
  days: number;
  checks: ExtensionCheckItem[];
  canSubmit: boolean;
  currentLeave: LeaveRequestRecord | null;
  newBackToWorkDate: string | null;
}

export interface ManagerQueueStats {
  awaitingYou: number;
  oldestInQueueDays: number;
  teamOutNextWeek: number;
  teamSize: number;
  notReturnedAsExpected: number;
}

export interface ManagerQueueItemRecord {
  id: number;
  kind: "leave" | "extension";
  employeeId: number;
  employeeName: string;
  department: string | null;
  type: "Annual Leave" | "Unpaid Extension";
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string | null;
  attachmentName: string | null;
  backToWorkDate: string;
  submittedAt: string;
  balance: LeaveBalance;
  teamOverlap: TeamOverlapEntry[];
}

export interface ManagerQueueResult {
  stats: ManagerQueueStats;
  queue: ManagerQueueItemRecord[];
}

export interface AdminStats {
  totalEmployees: number;
  departmentCount: number;
  currentlyOnLeave: number;
  upcomingThisMonth: number;
  notReturnedAsExpected: number;
  pendingApprovals: number;
  pendingOver3DaysOld: number;
}

export interface AdminBackToWorkRowRecord {
  employeeId: number;
  name: string;
  department: string | null;
  expectedBackToWorkDate: string;
  actualBackToWorkDate: string | null;
  status: "Returned" | "Upcoming" | "Overdue";
}

export interface AdminEligibilityCandidate {
  employeeId: number;
  name: string;
  joiningDate: string;
  daysUntilEligible: number;
}

export interface AdminDepartmentLoadRecord {
  department: string;
  onLeave: number;
  headcount: number;
}

export interface AdminOverview {
  stats: AdminStats;
  backToWorkWatchlist: AdminBackToWorkRowRecord[];
  approachingEligibility: AdminEligibilityCandidate[];
  departmentLoad: AdminDepartmentLoadRecord[];
}

export interface ManagerOverviewStats {
  teamSize: number;
  currentlyOnLeave: number;
  pendingApprovals: number;
  teamOutNextWeek: number;
  notReturnedAsExpected: number;
}

export interface ManagerOnLeaveRowRecord {
  employeeId: number;
  name: string;
  department: string | null;
  type: "Annual Leave" | "Unpaid Extension";
  startDate: string;
  endDate: string;
  expectedBackToWorkDate: string;
}

export interface ManagerOverview {
  stats: ManagerOverviewStats;
  currentlyOnLeave: ManagerOnLeaveRowRecord[];
  backToWorkWatchlist: AdminBackToWorkRowRecord[];
}

export interface TeamHistoryRow {
  employeeId: number;
  employeeName: string;
  department: string | null;
  kind: "leave" | "extension";
  type: "Annual Leave" | "Unpaid Extension";
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: LeaveDecisionStatus;
  decidedByName: string | null;
  submittedAt: string;
}

export interface TeamCalendarBar {
  startDate: string;
  endDate: string;
  type: "Annual Leave" | "Unpaid Extension";
  status: LeaveDecisionStatus;
}

export interface TeamCalendarPerson {
  employeeId: number;
  name: string;
  department: string | null;
  bars: TeamCalendarBar[];
}

export interface TeamCalendarResult {
  month: string;
  people: TeamCalendarPerson[];
}

export interface EmployeeDirectoryRow {
  employee: EmployeeProfile;
  managerName: string | null;
  balance: LeaveBalance;
}

export interface EmployeeFormValues {
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  role: UserRole;
  managerId: number | null;
  joiningDate: string;
  annualEntitlementDays: number;
  isActive: boolean;
}

export interface LeaveCycleRecord {
  id: number;
  employeeId: number;
  cycleStart: string;
  cycleEnd: string;
  entitlementDays: number;
  generatedReason: "initial" | "renewal";
  sourceLeaveRequestId: number | null;
  createdAt: string;
}

export interface NotificationRecord {
  id: number;
  action: string;
  message: string;
  leaveRequestId: number | null;
  extensionId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuditHistoryRow {
  id: number;
  employeeName: string;
  performedByName: string;
  performedByRole: UserRole;
  action: string;
  actionLabel: string;
  leaveRequestId: number | null;
  leaveRequestSummary: string | null;
  performedAt: string;
}

export interface CompanySettings {
  defaultAnnualEntitlementDays: number;
  eligibilityMonths: number;
  cycleLengthMonths: number;
  backToWorkWatchlistDays: number;
  approachingEligibilityDays: number;
  pendingApprovalAlertDays: number;
  updatedAt: string;
}

export interface AdminLeaveRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string | null;
  kind: "leave" | "extension";
  type: "Annual Leave" | "Unpaid Extension";
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string | null;
  status: LeaveDecisionStatus;
  expectedBackToWorkDate: string | null;
  actualBackToWorkDate: string | null;
  submittedAt: string;
}

export interface CorrectLeaveRecordInput {
  startDate?: string;
  endDate?: string;
  reason?: string | null;
  status?: LeaveDecisionStatus;
}

export interface AdminReportsResult {
  cycleLabel: string;
  year: number;
  availableYears: number[];
  department: string | null;
  departments: string[];
  stats: {
    daysTakenYtd: number;
    daysTakenPriorPeriod: number;
    deltaPercent: number;
    avgPerEmployee: number;
    avgEntitlement: number;
    overdueCount: number;
    overdueNames: string[];
    unpaidDays: number;
    unpaidPendingCount: number;
    unpaidApprovedCount: number;
  };
  monthly: { label: string; days: number; heightPercent: number }[];
  leaveTypeSplit: { type: "Annual Leave" | "Unpaid Extension"; days: number; percent: number }[];
  departmentTable: {
    name: string;
    headcount: number;
    daysTaken: number;
    utilizationPercent: number;
    pending: number;
    liabilityDays: number;
  }[];
  totalLiabilityDays: number;
}
