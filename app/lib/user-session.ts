import type { User } from "~/types/api";

const USER_STORAGE_KEY = "verispect_user";

export function saveUserToStorage(user: User) {
    try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
        console.warn("Could not save user to localStorage", e);
    }
}

export function getStoredUser(): User | null {
    try {
        const raw = localStorage.getItem(USER_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
}

export function clearStoredUser() {
    try {
        localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
        // ignore
    }
}
