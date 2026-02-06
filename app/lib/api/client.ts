import { auth } from "../../firebase";
import { getDemoRole, isDemoMode } from "~/lib/demo-context";

const BASE_URL = import.meta.env.VITE_API_URL;
const DEMO_ROLE_HEADER = "X-Demo-Role";

type FetchOptions = RequestInit & {
    params?: Record<string, string>;
};

export class ApiError extends Error {
    status: number;
    statusText: string;

    constructor(status: number, statusText: string, message?: string) {
        super(message || statusText);
        this.status = status;
        this.statusText = statusText;
    }
}

export async function client<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...init } = options;

    const effectivePath = typeof window !== "undefined" && isDemoMode()
        ? (path.startsWith("/v1") ? path.replace("/v1", "/demo") : path)
        : path;
    const url = new URL(effectivePath, BASE_URL);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });
    }

    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
        headers.set("Content-Type", "application/json");
    }

    if (typeof window !== "undefined" && isDemoMode()) {
        headers.set(DEMO_ROLE_HEADER, getDemoRole());
    } else {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const idToken = await currentUser.getIdToken();
            headers.set("Authorization", `Bearer ${idToken}`);
        }
    }

    const response = await fetch(url.toString(), {
        ...init,
        headers,
    });

    if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
    }

    // Handle empty responses
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

/** Like client() but returns { data, status } so callers can distinguish 200 vs 201 etc. */
export async function clientWithStatus<T>(path: string, options: FetchOptions = {}): Promise<{ data: T; status: number }> {
    const { params, ...init } = options;

    const effectivePath = typeof window !== "undefined" && isDemoMode()
        ? (path.startsWith("/v1") ? path.replace("/v1", "/demo") : path)
        : path;
    const url = new URL(effectivePath, BASE_URL);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });
    }

    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
        headers.set("Content-Type", "application/json");
    }

    if (typeof window !== "undefined" && isDemoMode()) {
        headers.set(DEMO_ROLE_HEADER, getDemoRole());
    } else {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const idToken = await currentUser.getIdToken();
            headers.set("Authorization", `Bearer ${idToken}`);
        }
    }

    const response = await fetch(url.toString(), {
        ...init,
        headers,
    });

    if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
    }

    if (response.status === 204) {
        return { data: {} as T, status: response.status };
    }

    const data = await response.json();
    return { data, status: response.status };
}
