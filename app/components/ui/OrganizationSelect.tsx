import { useEffect, useState } from "react";
import { getOrganizations } from "~/lib/api";
import type { Organization } from "~/types/api";

export interface OrganizationSelectProps {
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    id?: string;
    name?: string;
    className?: string;
}

const selectClassName =
    "block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";

export function OrganizationSelect({
    value,
    onChange,
    required = false,
    id = "org_id",
    name = "org_id",
    className = selectClassName,
}: OrganizationSelectProps) {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getOrganizations();
                if (!cancelled) {
                    setOrganizations(data || []);
                    setLoadError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to load organizations:", err);
                    setLoadError("Failed to load organizations");
                    setOrganizations([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

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
                <option value="">Loading organizations...</option>
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
            <option value="">Select organization</option>
            {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                    {org.name || org.id}
                </option>
            ))}
        </select>
    );
}
