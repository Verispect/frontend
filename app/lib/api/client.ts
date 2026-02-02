import { auth } from "../../firebase";

const BASE_URL = import.meta.env.VITE_API_URL;

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

    const url = new URL(path, BASE_URL);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });
    }

    const headers = new Headers(init.headers);
    if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
        headers.set('Content-Type', 'application/json');
    }

    // Attach Firebase ID token if a user is logged in
    const currentUser = auth.currentUser;
    if (currentUser) {
        const idToken = await currentUser.getIdToken();
        headers.set('Authorization', `Bearer ${idToken}`);
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
