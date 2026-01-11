import type { Route } from "./+types/tasks";
import { useEffect, useState } from "react";
import { createTask, deleteTask, getOrganizations, getTasks, updateTask } from "~/lib/api";
import type { Organization, Task, TaskStatus, TaskTypeEnum } from "~/types/api";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Tasks - Verispect" }];
}

export default function Tasks() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string>("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOrgsLoading, setIsOrgsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        inspection_id: "",
        assigned_to: "",
        status: "DRAFT" as TaskStatus,
        type: "CLEANING" as TaskTypeEnum,
        details: "{}",
    });

    useEffect(() => {
        loadOrganizations();
    }, []);

    useEffect(() => {
        if (selectedOrgId) {
            loadTasks(selectedOrgId);
        } else {
            setTasks([]);
        }
    }, [selectedOrgId]);

    async function loadOrganizations() {
        try {
            setIsOrgsLoading(true);
            const data = await getOrganizations();
            setOrganizations(data || []);
            // Auto select if only one? No, let user choose.
        } catch (err) {
            console.error("Failed to load organizations:", err);
            setError("Failed to load organizations");
        } finally {
            setIsOrgsLoading(false);
        }
    }

    async function loadTasks(orgId: string) {
        try {
            setIsLoading(true);
            const data = await getTasks(orgId);
            setTasks(data || []);
        } catch (err) {
            console.error("Failed to load tasks:", err);
            setError("Failed to load tasks");
        } finally {
            setIsLoading(false);
        }
    }

    function handleOpenModal(task?: Task) {
        if (!selectedOrgId) {
            setError("Please select an organization first");
            return;
        }

        if (task) {
            setEditingTask(task);
            setFormData({
                inspection_id: task.inspection_id || "",
                assigned_to: task.assigned_to || "",
                status: task.status,
                type: task.type,
                details: JSON.stringify(task.details, null, 2) || "{}",
            });
        } else {
            setEditingTask(null);
            setFormData({
                inspection_id: "",
                assigned_to: "",
                status: "DRAFT",
                type: "CLEANING",
                details: "{}",
            });
        }
        setIsModalOpen(true);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!selectedOrgId) return;

        try {
            let detailsJson;
            try {
                detailsJson = JSON.parse(formData.details);
            } catch (e) {
                setError("Invalid JSON in details");
                return;
            }

            const inspectionId = formData.inspection_id.trim() === "" ? undefined : formData.inspection_id;
            const assignedTo = formData.assigned_to.trim() === "" ? undefined : formData.assigned_to;

            if (editingTask) {
                await updateTask(editingTask.id, {
                    org_id: selectedOrgId, // Should match? Yes assuming we don't move tasks between orgs often.
                    inspection_id: inspectionId,
                    assigned_to: assignedTo,
                    status: formData.status,
                    type: formData.type,
                    details: detailsJson,
                });
            } else {
                await createTask({
                    org_id: selectedOrgId,
                    inspection_id: inspectionId,
                    assigned_to: assignedTo,
                    status: formData.status,
                    type: formData.type,
                    details: detailsJson,
                });
            }

            setIsModalOpen(false);
            loadTasks(selectedOrgId);
        } catch (err) {
            console.error("Failed to save task:", err);
            setError("Failed to save task");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            await deleteTask(id);
            if (selectedOrgId) loadTasks(selectedOrgId);
        } catch (err) {
            console.error("Failed to delete task:", err);
            setError("Failed to delete task");
        }
    }

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'VERIFIED': return 'bg-green-400/10 text-green-400 ring-green-400/30';
            case 'SUBMITTED': return 'bg-blue-400/10 text-blue-400 ring-blue-400/30';
            case 'PENDING_PROOF': return 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/30';
            default: return 'bg-gray-400/10 text-gray-400 ring-gray-400/30';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Tasks
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Manage tasks and workflows.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-x-4">
                    <button
                        onClick={() => handleOpenModal()}
                        disabled={!selectedOrgId}
                        className={`flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${!selectedOrgId
                                ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                                : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'
                            }`}
                    >
                        New Task
                    </button>
                </div>
            </div>

            {/* Organization Selector */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <label htmlFor="org-select" className="block text-sm font-medium leading-6 text-gray-300">
                    Select Organization
                </label>
                <div className="mt-2">
                    {isOrgsLoading ? (
                        <p className="text-sm text-gray-400">Loading organizations...</p>
                    ) : (
                        <select
                            id="org-select"
                            className="block w-full max-w-md rounded-md border-0 bg-gray-900 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={selectedOrgId}
                            onChange={(e) => setSelectedOrgId(e.target.value)}
                        >
                            <option value="">-- Select an Organization --</option>
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-900/50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-400">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                {!selectedOrgId ? (
                    <div className="p-6 text-center text-gray-400">
                        <p>Select an organization to view tasks.</p>
                    </div>
                ) : isLoading ? (
                    <div className="p-6 text-center text-gray-400">Loading...</div>
                ) : tasks.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                        <p>No tasks found for this organization.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Assigned To
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-gray-900">
                            {tasks.map((task) => (
                                <tr key={task.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {task.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(task.status)}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                        {task.assigned_to ? (task.assigned_to.substring(0, 8) + '...') : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(task)}
                                            className="text-indigo-400 hover:text-indigo-300 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(task.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="fixed inset-0 bg-gray-950/75 transition-opacity" onClick={() => setIsModalOpen(false)} />

                    <div className="relative transform overflow-hidden rounded-lg bg-gray-900 border border-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                        <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                            <button
                                type="button"
                                className="rounded-md bg-gray-900 text-gray-400 hover:text-gray-500 focus:outline-none"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                <h3 className="text-base font-semibold leading-6 text-white" id="modal-title">
                                    {editingTask ? "Edit Task" : "New Task"}
                                </h3>
                                <div className="mt-2">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-300">
                                                Type
                                            </label>
                                            <div className="mt-2">
                                                <select
                                                    id="type"
                                                    name="type"
                                                    required
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskTypeEnum })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                >
                                                    <option value="CLEANING">Cleaning</option>
                                                    <option value="MAINTENANCE">Maintenance</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-300">
                                                Status
                                            </label>
                                            <div className="mt-2">
                                                <select
                                                    id="status"
                                                    name="status"
                                                    required
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                >
                                                    <option value="DRAFT">Draft</option>
                                                    <option value="PENDING_PROOF">Pending Proof</option>
                                                    <option value="SUBMITTED">Submitted</option>
                                                    <option value="VERIFIED">Verified</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="assigned_to" className="block text-sm font-medium leading-6 text-gray-300">
                                                Assigned To (User ID) (Optional)
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="assigned_to"
                                                    id="assigned_to"
                                                    value={formData.assigned_to}
                                                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="inspection_id" className="block text-sm font-medium leading-6 text-gray-300">
                                                Inspection ID (Optional)
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="inspection_id"
                                                    id="inspection_id"
                                                    value={formData.inspection_id}
                                                    onChange={(e) => setFormData({ ...formData, inspection_id: e.target.value })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="details" className="block text-sm font-medium leading-6 text-gray-300">
                                                Details (JSON)
                                            </label>
                                            <div className="mt-2">
                                                <textarea
                                                    name="details"
                                                    id="details"
                                                    rows={4}
                                                    value={formData.details}
                                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                            <button
                                                type="submit"
                                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-300 shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-700 sm:mt-0 sm:w-auto"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
