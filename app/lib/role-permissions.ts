import type { UserRole } from "~/types/api";

const DASHBOARD = "/dashboard";
const ORGANIZATIONS = "/dashboard/organizations";
const USERS = "/dashboard/users";
const INSPECTIONS = "/dashboard/inspections";
const EVIDENCE = "/dashboard/evidence";
const REPORTS = "/dashboard/reports";
const TASKS = "/dashboard/tasks";
const CHOOSE_ROLE = "/dashboard/choose-role";

const ROUTES_BY_ROLE: Record<UserRole, string[]> = {
  admin: [DASHBOARD, ORGANIZATIONS, USERS, INSPECTIONS, EVIDENCE, REPORTS, TASKS],
  manager: [DASHBOARD, USERS, INSPECTIONS, EVIDENCE, REPORTS, TASKS],
  inspector: [DASHBOARD, INSPECTIONS, EVIDENCE, REPORTS, TASKS],
  cleaner: [DASHBOARD, EVIDENCE, TASKS],
};

export function allowedRoutes(role: UserRole): string[] {
  return ROUTES_BY_ROLE[role] ?? [];
}

/** Normalize path for permission check: strip trailing slash and map /demo to /dashboard */
function normalizePathForRole(path: string): string {
  const trimmed = path.replace(/\/$/, "") || DASHBOARD;
  if (trimmed.startsWith("/demo")) {
    return trimmed.replace(/^\/demo/, "/dashboard");
  }
  return trimmed;
}

export function canAccess(role: UserRole, path: string): boolean {
  const normalized = normalizePathForRole(path);
  const allowed = ROUTES_BY_ROLE[role];
  if (!allowed) return false;
  if (normalized === CHOOSE_ROLE) return true;
  return allowed.includes(normalized);
}
