import { useEffect, useState } from "react";
import { getTasks } from "~/lib/api";
import type { Task } from "~/types/api";

export interface TaskSelectProps {
    value: string;
    onChange: (value: string) => void;
    orgId: string;
    placeholder?: string;
    id?: string;
    className?: string;
}

const selectClassName =
    "block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";

function formatOptionLabel(task: Task) {
    return `${task.type} - ${task.status} (${new Date(task.created_at).toLocaleDateString()})`;
}

export function TaskSelect({
    value,
    onChange,
    orgId,
    placeholder = "-- Select a Task --",
    id = "task-select",
    className,
}: TaskSelectProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (!orgId) {
            setTasks([]);
            setIsLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            try {
                const data = await getTasks(orgId);
                if (!cancelled) {
                    setTasks(data || []);
                    setLoadError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to load tasks:", err);
                    setLoadError("Failed to load tasks");
                    setTasks([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [orgId]);

    if (!orgId) {
        return <p className="text-sm text-gray-400">Select an organization first.</p>;
    }
    if (isLoading) {
        return <p className="text-sm text-gray-400">Loading tasks...</p>;
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
            {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                    {formatOptionLabel(task)}
                </option>
            ))}
        </select>
    );
}
