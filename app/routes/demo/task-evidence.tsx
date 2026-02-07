import type { Route } from "./+types/task-evidence";
import { useEffect, useState } from "react";
import { TaskSelect } from "~/components/ui/TaskSelect";
import {
    getTaskEvidence,
    createTaskEvidence,
    createTaskEvidenceFormData,
    deleteTaskEvidence,
} from "~/lib/api";
import type { TaskEvidence, TaskEvidenceType } from "~/types/api";
import { DEMO_ORG_ID } from "~/lib/demo-context";

export function meta({}: Route.MetaArgs) {
    return [{ title: "Demo - Task Evidence - Verispect" }];
}

export default function DemoTaskEvidencePage() {
    const [selectedTaskId, setSelectedTaskId] = useState<string>("");
    const [items, setItems] = useState<TaskEvidence[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formType, setFormType] = useState<TaskEvidenceType>("BEFORE");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (selectedTaskId) {
            loadTaskEvidence(selectedTaskId);
        } else {
            setItems([]);
        }
    }, [selectedTaskId]);

    async function loadTaskEvidence(taskId: string) {
        try {
            setIsLoading(true);
            const data = await getTaskEvidence(taskId);
            setItems(data || []);
        } catch (err) {
            console.error("Failed to load task evidence:", err);
            setError("Failed to load task evidence");
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }

    function handleOpenModal() {
        if (!selectedTaskId) {
            setError("Please select a task first");
            return;
        }
        setFormType("BEFORE");
        setSelectedFile(null);
        setIsModalOpen(true);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!selectedTaskId) return;
        try {
            if (selectedFile) {
                const body = new FormData();
                body.append("image", selectedFile);
                body.append("task_id", selectedTaskId);
                body.append("type", formType);
                await createTaskEvidenceFormData(body);
            } else {
                await createTaskEvidence({
                    task_id: selectedTaskId,
                    type: formType,
                });
            }
            setIsModalOpen(false);
            loadTaskEvidence(selectedTaskId);
        } catch (err) {
            console.error("Failed to create task evidence:", err);
            setError("Failed to create task evidence");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this task evidence?")) return;
        try {
            await deleteTaskEvidence(id);
            if (selectedTaskId) loadTaskEvidence(selectedTaskId);
        } catch (err) {
            console.error("Failed to delete task evidence:", err);
            setError("Failed to delete task evidence");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Task Evidence
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Manage before/after evidence linked to tasks.
                    </p>
                </div>
                <button
                    onClick={handleOpenModal}
                    disabled={!selectedTaskId}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        !selectedTaskId
                            ? "bg-gray-700 cursor-not-allowed text-gray-400"
                            : "bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
                    }`}
                >
                    Add Task Evidence
                </button>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <label htmlFor="task-select" className="block text-sm font-medium leading-6 text-gray-300">
                    Task
                </label>
                <div className="mt-2 max-w-md">
                    <TaskSelect
                        orgId={DEMO_ORG_ID}
                        value={selectedTaskId}
                        onChange={setSelectedTaskId}
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-900/50 p-4">
                    <h3 className="text-sm font-medium text-red-400">{error}</h3>
                </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                {!selectedTaskId ? (
                    <div className="p-6 text-center text-gray-400">
                        Select a task to view task evidence.
                    </div>
                ) : isLoading ? (
                    <div className="p-6 text-center text-gray-400">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                        No task evidence for this task.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    S3 Key
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Created
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-gray-900">
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {item.type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400 font-mono max-w-xs truncate">
                                        {item.s3_key || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(item.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(item.id)}
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
                                <h3 className="text-base font-semibold leading-6 text-white">
                                    New Task Evidence
                                </h3>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium leading-6 text-gray-300">Type</label>
                                        <div className="mt-2">
                                            <select
                                                value={formType}
                                                onChange={(e) => setFormType(e.target.value as TaskEvidenceType)}
                                                className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                            >
                                                <option value="BEFORE">BEFORE</option>
                                                <option value="AFTER">AFTER</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium leading-6 text-gray-300">Image</label>
                                        <div className="mt-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                                                className="block w-full text-sm text-gray-400 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:hover:bg-indigo-500"
                                            />
                                            {selectedFile && (
                                                <p className="mt-1 text-xs text-gray-500">{selectedFile.name}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">Optional: upload an image to store as evidence.</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="inline-flex justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-300 ring-1 ring-inset ring-gray-700 hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
