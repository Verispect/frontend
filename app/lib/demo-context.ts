import type { UserRole } from "~/types/api";

const DEMO_ROLE_KEY = "demo-role";
const DEFAULT_DEMO_ROLE: UserRole = "manager";

/** Hardcoded demo organization ID (must match backend DEMO_ORG_ID). */
export const DEMO_ORG_ID = "223e4567-e89b-12d3-a456-426614174000";

const VALID_ROLES: UserRole[] = ["admin", "manager", "inspector", "cleaner"];

function isValidRole(value: string): value is UserRole {
    return VALID_ROLES.includes(value as UserRole);
}

export function getDemoRole(): UserRole {
    if (typeof window === "undefined") return DEFAULT_DEMO_ROLE;
    try {
        const stored = localStorage.getItem(DEMO_ROLE_KEY);
        if (stored && isValidRole(stored)) return stored;
    } catch {
        // ignore
    }
    return DEFAULT_DEMO_ROLE;
}

export function setDemoRole(role: UserRole): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(DEMO_ROLE_KEY, role);
    } catch {
        // ignore
    }
}

export function isDemoMode(): boolean {
    if (typeof window === "undefined") return false;
    return window.location.pathname.startsWith("/demo");
}
