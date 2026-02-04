import { useEffect, useState } from "react";
import { getUsers } from "~/lib/api";
import type { User, UserRole } from "~/types/api";

export interface UserSelectProps {
    orgId: string;
    role?: UserRole;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    id?: string;
    name?: string;
    className?: string;
}

const selectClassName =
    "block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";

export function UserSelect({
    orgId,
    role,
    value,
    onChange,
    required = false,
    id = "user_id",
    name = "user_id",
    className = selectClassName,
}: UserSelectProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (!orgId.trim()) {
            setUsers([]);
            setLoadError(null);
            return;
        }
        let cancelled = false;
        setIsLoading(true);
        setLoadError(null);
        (async () => {
            try {
                const data = await getUsers(orgId, role);
                if (!cancelled) {
                    setUsers(data || []);
                    setLoadError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to load users:", err);
                    setLoadError("Failed to load users");
                    setUsers([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [orgId, role]);

    if (!orgId.trim()) {
        return (
            <select
                id={id}
                name={name}
                required={required}
                disabled
                className={className}
                value=""
            >
                <option value="">Select organization first</option>
            </select>
        );
    }

    if (isLoading) {
        return (
            <select
                id={id}
                name={name}
                required={required}
                disabled
                className={className}
                value=""
            >
                <option value="">Loading users...</option>
            </select>
        );
    }

    if (loadError) {
        return (
            <select
                id={id}
                name={name}
                required={required}
                disabled
                className={className}
                value=""
            >
                <option value="">{loadError}</option>
            </select>
        );
    }

    return (
        <select
            id={id}
            name={name}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={className}
        >
            <option value="">No user (optional)</option>
            {users.map((user) => (
                <option key={user.id} value={user.id}>
                    {user.email}
                </option>
            ))}
        </select>
    );
}
