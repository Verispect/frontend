import type { Route } from "./+types/reports";
import { useEffect, useState } from "react";
import { createReport, deleteReport, getInspections, getReports, updateReport } from "~/lib/api";
import type { Inspection, Report, ReportStatus } from "~/types/api";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Reports - Verispect" }];
}

export default function Reports() {
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [selectedInspectionId, setSelectedInspectionId] = useState<string>("");
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInspectionsLoading, setIsInspectionsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<Report | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        status: "DRAFT" as ReportStatus,
        s3_key: "",
        content: "{}",
    });

    useEffect(() => {
        loadInspections();
    }, []);

    useEffect(() => {
        if (selectedInspectionId) {
            loadReports(selectedInspectionId);
        } else {
            setReports([]);
        }
    }, [selectedInspectionId]);

    async function loadInspections() {
        try {
            setIsInspectionsLoading(true);
            const data = await getInspections();
            setInspections(data || []);
        } catch (err) {
            console.error("Failed to load inspections:", err);
            setError("Failed to load inspections");
        } finally {
            setIsInspectionsLoading(false);
        }
    }

    async function loadReports(inspectionId: string) {
        try {
            setIsLoading(true);
            const data = await getReports(inspectionId);
            setReports(data || []);
        } catch (err) {
            console.error("Failed to load reports:", err);
            setError("Failed to load reports");
        } finally {
            setIsLoading(false);
        }
    }

    function handleOpenModal(report?: Report) {
        if (!selectedInspectionId) {
            setError("Please select an inspection first");
            return;
        }

        if (report) {
            setEditingReport(report);
            setFormData({
                status: report.status,
                s3_key: report.s3_key || "",
                content: JSON.stringify(report.content, null, 2) || "{}",
            });
        } else {
            setEditingReport(null);
            setFormData({
                status: "DRAFT",
                s3_key: "",
                content: "{}",
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
            let contentJson;
            try {
                contentJson = JSON.parse(formData.content);
            } catch (e) {
                setError("Invalid JSON in content");
                return;
            }

            if (editingReport) {
                await updateReport(editingReport.id, {
                    status: formData.status,
                    s3_key: formData.s3_key || undefined,
                    content: contentJson,
                });
            } else {
                await createReport({
                    inspection_id: selectedInspectionId,
                    status: formData.status,
                    s3_key: formData.s3_key || undefined,
                    content: contentJson,
                });
            }

            setIsModalOpen(false);
            loadReports(selectedInspectionId);
        } catch (err) {
            console.error("Failed to save report:", err);
            setError("Failed to save report");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this report?")) return;

        try {
            await deleteReport(id);
            if (selectedInspectionId) loadReports(selectedInspectionId);
        } catch (err) {
            console.error("Failed to delete report:", err);
            setError("Failed to delete report");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Reports
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Manage reports for inspections.
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
                        New Report
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
                        <p>Select an inspection to view reports.</p>
                    </div>
                ) : isLoading ? (
                    <div className="p-6 text-center text-gray-400">Loading...</div>
                ) : reports.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                        <p>No reports found for this inspection.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    S3 Key
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-gray-900">
                            {reports.map((report) => (
                                <tr key={report.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${report.status === 'FINAL'
                                                ? 'bg-green-400/10 text-green-400 ring-green-400/30'
                                                : 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/30'
                                            }`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                        {report.s3_key ? (report.s3_key.length > 20 ? report.s3_key.substring(0, 20) + '...' : report.s3_key) : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(report)}
                                            className="text-indigo-400 hover:text-indigo-300 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(report.id)}
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
                                    {editingReport ? "Edit Report" : "New Report"}
                                </h3>
                                <div className="mt-2">
                                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ReportStatus })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                >
                                                    <option value="DRAFT">Draft</option>
                                                    <option value="FINAL">Final</option>
                                                </select>
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
                                            <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-300">
                                                Content (JSON)
                                            </label>
                                            <div className="mt-2">
                                                <textarea
                                                    name="content"
                                                    id="content"
                                                    rows={4}
                                                    value={formData.content}
                                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
