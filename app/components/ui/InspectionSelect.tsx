import { useEffect, useState } from "react";
import { getInspections } from "~/lib/api";
import type { Inspection } from "~/types/api";

export interface InspectionSelectProps {
    value: string;
    onChange: (value: string) => void;
    orgId?: string;
    label?: string;
    placeholder?: string;
    id?: string;
    className?: string;
    /** If true, renders the full block with label and wrapper (default: true) */
    withWrapper?: boolean;
}

const selectClassName =
    "block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";

function formatOptionLabel(insp: Inspection) {
    return `${insp.type} - ${new Date(insp.created_at).toLocaleDateString()} (${insp.status})`;
}

export function InspectionSelect({
    value,
    onChange,
    orgId,
    placeholder = "-- Select an Inspection --",
    id = "inspection-select",
    className,
}: InspectionSelectProps) {
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getInspections(orgId);
                if (!cancelled) {
                    setInspections(data || []);
                    setLoadError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to load inspections:", err);
                    setLoadError("Failed to load inspections");
                    setInspections([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [orgId]);

    if (isLoading) {
        return <p className="text-sm text-gray-400">Loading inspections...</p>;
    }
    if (loadError) {
        return <p className="text-sm text-red-400">{loadError}</p>;
    }


    return (
        <select
            id={id}
            className={className ?? selectClassName}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">{placeholder}</option>
            {inspections.map((insp) => (
                <option key={insp.id} value={insp.id}>
                    {formatOptionLabel(insp)}
                </option>
            ))}
        </select>
    );
}
