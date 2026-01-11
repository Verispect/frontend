import type { Route } from "./+types/evidence";
import { useEffect, useState } from "react";
import { createEvidenceItem, deleteEvidenceItem, getEvidenceItems, getInspections } from "~/lib/api";
import type { EvidenceItem, Inspection } from "~/types/api";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Evidence - Verispect" }];
}

export default function Evidence() {
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [selectedInspectionId, setSelectedInspectionId] = useState<string>("");
    const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInspectionsLoading, setIsInspectionsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EvidenceItem | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        room: "",
        description: "",
        s3_key: "",
        ai_metadata: "{}",
    });

    useEffect(() => {
        loadInspections();
    }, []);

    useEffect(() => {
        if (selectedInspectionId) {
            loadEvidence(selectedInspectionId);
        } else {
            setEvidenceItems([]);
        }
    }, [selectedInspectionId]);

    async function loadInspections() {
        try {
            setIsInspectionsLoading(true);
            const data = await getInspections();
            setInspections(data || []);
            if (data && data.length > 0) {
                // Optionally select the first one, or let user select
                // setSelectedInspectionId(data[0].id);
            }
        } catch (err) {
            console.error("Failed to load inspections:", err);
            setError("Failed to load inspections");
        } finally {
            setIsInspectionsLoading(false);
        }
    }

    async function loadEvidence(inspectionId: string) {
        try {
            setIsLoading(true);
            const data = await getEvidenceItems(inspectionId);
            setEvidenceItems(data || []);
        } catch (err) {
            console.error("Failed to load evidence:", err);
            setError("Failed to load evidence");
        } finally {
            setIsLoading(false);
        }
    }

    function handleOpenModal(item?: EvidenceItem) {
        if (!selectedInspectionId) {
            setError("Please select an inspection first");
            return;
        }

        if (item) {
            setEditingItem(item);
            setFormData({
                room: item.room || "",
                description: item.description || "",
                s3_key: item.s3_key || "",
                ai_metadata: JSON.stringify(item.ai_metadata, null, 2) || "{}",
            });
        } else {
            setEditingItem(null);
            setFormData({
                room: "",
                description: "",
                s3_key: "",
                ai_metadata: "{}",
            });
        }
        setIsModalOpen(true);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!selectedInspectionId) return;

        try {
            let aiMetadataJson;
            try {
                aiMetadataJson = JSON.parse(formData.ai_metadata);
            } catch (e) {
                setError("Invalid JSON in AI metadata");
                return;
            }

            if (editingItem) {
                // There is no updateEvidenceItem in the API client provided in the context!
                // Checking frontend/app/lib/api/index.ts...
                // It only has: getEvidenceItems, getEvidenceItem, createEvidenceItem, deleteEvidenceItem.
                // It seems UPDAATE is missing for EvidenceItem in the provided file content previously read.
                // I will skip update logic or implement it if I missed it.
                // Re-reading step 11: Yes, createEvidenceItem, but NO updateEvidenceItem.
                // So I will only support CREATE in this form if editing is not supported.
                // Or I can disable the Edit button.
                // Actually, I'll alert the user.
                setError("Update is not supported for Evidence Items currently (API limitation).");
                return;
            } else {
                await createEvidenceItem({
                    inspection_id: selectedInspectionId,
                    room: formData.room,
                    description: formData.description,
                    s3_key: formData.s3_key,
                    ai_metadata: aiMetadataJson,
                });
            }

            setIsModalOpen(false);
            loadEvidence(selectedInspectionId);
        } catch (err) {
            console.error("Failed to save evidence:", err);
            setError("Failed to save evidence");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this evidence item?")) return;

        try {
            await deleteEvidenceItem(id);
            if (selectedInspectionId) loadEvidence(selectedInspectionId);
        } catch (err) {
            console.error("Failed to delete evidence:", err);
            setError("Failed to delete evidence");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Evidence
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Manage evidence items for inspections.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-x-4">
                    <button
                        onClick={() => handleOpenModal()}
                        disabled={!selectedInspectionId}
                        className={`flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${!selectedInspectionId
                                ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                                : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'
                            }`}
                    >
                        Add Evidence
                    </button>
                </div>
            </div>

            {/* Inspection Selector */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <label htmlFor="inspection-select" className="block text-sm font-medium leading-6 text-gray-300">
                    Select Inspection
                </label>
                <div className="mt-2">
                    {isInspectionsLoading ? (
                        <p className="text-sm text-gray-400">Loading inspections...</p>
                    ) : (
                        <select
                            id="inspection-select"
                            className="block w-full max-w-md rounded-md border-0 bg-gray-900 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={selectedInspectionId}
                            onChange={(e) => setSelectedInspectionId(e.target.value)}
                        >
                            <option value="">-- Select an Inspection --</option>
                            {inspections.map((insp) => (
                                <option key={insp.id} value={insp.id}>
                                    {insp.type} - {new Date(insp.created_at).toLocaleDateString()} ({insp.status})
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
                {!selectedInspectionId ? (
                    <div className="p-6 text-center text-gray-400">
                        <p>Select an inspection to view items.</p>
                    </div>
                ) : isLoading ? (
                    <div className="p-6 text-center text-gray-400">Loading...</div>
                ) : evidenceItems.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                        <p>No evidence items found for this inspection.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Room
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Description
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    S3 Key
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-gray-900">
                            {evidenceItems.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {item.room || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {item.description || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                        {item.s3_key ? (item.s3_key.length > 20 ? item.s3_key.substring(0, 20) + '...' : item.s3_key) : "-"}
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
                                    New Evidence Item
                                </h3>
                                <div className="mt-2">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="room" className="block text-sm font-medium leading-6 text-gray-300">
                                                Room
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="room"
                                                    id="room"
                                                    value={formData.room}
                                                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-300">
                                                Description
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="description"
                                                    id="description"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="s3_key" className="block text-sm font-medium leading-6 text-gray-300">
                                                S3 Key (Optional)
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="s3_key"
                                                    id="s3_key"
                                                    value={formData.s3_key}
                                                    onChange={(e) => setFormData({ ...formData, s3_key: e.target.value })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="ai_metadata" className="block text-sm font-medium leading-6 text-gray-300">
                                                AI Metadata (JSON)
                                            </label>
                                            <div className="mt-2">
                                                <textarea
                                                    name="ai_metadata"
                                                    id="ai_metadata"
                                                    rows={4}
                                                    value={formData.ai_metadata}
                                                    onChange={(e) => setFormData({ ...formData, ai_metadata: e.target.value })}
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
