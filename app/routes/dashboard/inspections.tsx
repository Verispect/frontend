import type { Route } from "./+types/inspections";
import { useEffect, useState } from "react";
import { UserSelect } from "~/components/ui/UserSelect";
import { OrganizationSelect } from "~/components/ui/OrganizationSelect";
import { createInspection, deleteInspection, getInspections, updateInspection } from "~/lib/api";
import type { Inspection, InspectionStatus } from "~/types/api";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Inspections - Verispect" }];
}

export default function Inspections() {
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        org_id: "",
        inspector_id: "",
        status: "IN_PROGRESS" as InspectionStatus,
        type: "",
        unit_metadata: "{}",
    });

    useEffect(() => {
        loadInspections();
    }, []);

    async function loadInspections() {
        try {
            setIsLoading(true);
            const data = await getInspections();
            setInspections(data || []);
        } catch (err) {
            console.error("Failed to load inspections:", err);
            setError("Failed to load inspections");
        } finally {
            setIsLoading(false);
        }
    }

    function handleOpenModal(inspection?: Inspection) {
        if (inspection) {
            setEditingInspection(inspection);
            setFormData({
                org_id: inspection.org_id,
                inspector_id: inspection.inspector_id || "",
                status: inspection.status,
                type: inspection.type,
                unit_metadata: JSON.stringify(inspection.unit_metadata, null, 2) || "{}",
            });
        } else {
            setEditingInspection(null);
            setFormData({
                org_id: "",
                inspector_id: "",
                status: "IN_PROGRESS",
                type: "",
                unit_metadata: "{}",
            });
        }
        setIsModalOpen(true);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        try {
            let metadataJson;
            try {
                metadataJson = JSON.parse(formData.unit_metadata);
            } catch (e) {
                setError("Invalid JSON in unit metadata");
                return;
            }

            // Convert empty string inspector_id to undefined/null for API if needed, 
            // but type says string | undefined.
            // If the user clears the input, we should probably send undefined or null.
            const inspectorId = formData.inspector_id.trim() === "" ? undefined : formData.inspector_id;

            if (editingInspection) {
                await updateInspection(editingInspection.id, {
                    org_id: formData.org_id,
                    inspector_id: inspectorId,
                    status: formData.status,
                    type: formData.type,
                    unit_metadata: metadataJson,
                });
            } else {
                await createInspection({
                    org_id: formData.org_id,
                    inspector_id: inspectorId,
                    status: formData.status,
                    type: formData.type,
                    unit_metadata: metadataJson,
                });
            }

            setIsModalOpen(false);
            loadInspections();
        } catch (err) {
            console.error("Failed to save inspection:", err);
            setError("Failed to save inspection");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this inspection?")) return;

        try {
            await deleteInspection(id);
            loadInspections();
        } catch (err) {
            console.error("Failed to delete inspection:", err);
            setError("Failed to delete inspection");
        }
    }

    const getStatusColor = (status: InspectionStatus) => {
        switch (status) {
            case 'VERIFIED': return 'bg-green-400/10 text-green-400 ring-green-400/30';
            case 'PENDING_APPROVAL': return 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/30';
            default: return 'bg-blue-400/10 text-blue-400 ring-blue-400/30';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Inspections
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Manage inspections and their status.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-x-4">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        New Inspection
                    </button>
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
                {isLoading ? (
                    <div className="p-6 text-center text-gray-400">Loading...</div>
                ) : inspections.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                        <p>No inspections found. Create one to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
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
                                        Org ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 bg-gray-900">
                                {inspections.map((inspection) => (
                                    <tr key={inspection.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                            {inspection.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(inspection.status)}`}>
                                                {inspection.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                            {inspection.org_id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(inspection.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenModal(inspection)}
                                                className="text-indigo-400 hover:text-indigo-300 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(inspection.id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                                    {editingInspection ? "Edit Inspection" : "New Inspection"}
                                </h3>
                                <div className="mt-2">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-300">
                                                Type
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="type"
                                                    id="type"
                                                    required
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
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
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as InspectionStatus })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                >
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="PENDING_APPROVAL">Pending Approval</option>
                                                    <option value="VERIFIED">Verified</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="org_id" className="block text-sm font-medium leading-6 text-gray-300">
                                                Organization
                                            </label>
                                            <div className="mt-2">
                                                <OrganizationSelect
                                                    value={formData.org_id}
                                                    onChange={(org_id) => setFormData({ ...formData, org_id })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="inspector_id" className="block text-sm font-medium leading-6 text-gray-300">
                                                Inspector (Optional)
                                            </label>
                                            <div className="mt-2">
                                                <UserSelect
                                                    orgId={formData.org_id}
                                                    role="inspector"
                                                    value={formData.inspector_id}
                                                    onChange={(inspector_id) => setFormData({ ...formData, inspector_id })}
                                                    id="inspector_id"
                                                    name="inspector_id"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="unit_metadata" className="block text-sm font-medium leading-6 text-gray-300">
                                                Unit Metadata (JSON)
                                            </label>
                                            <div className="mt-2">
                                                <textarea
                                                    name="unit_metadata"
                                                    id="unit_metadata"
                                                    rows={4}
                                                    value={formData.unit_metadata}
                                                    onChange={(e) => setFormData({ ...formData, unit_metadata: e.target.value })}
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
