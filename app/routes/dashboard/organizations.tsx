import type { Route } from "./+types/organizations";
import { useEffect, useState } from "react";
import { createOrganization, deleteOrganization, getOrganizations, updateOrganization } from "~/lib/api";
import type { Organization } from "~/types/api";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Organizations - Verispect" }];
}

export default function Organizations() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        settings: "{}",
    });

    useEffect(() => {
        loadOrganizations();
    }, []);

    async function loadOrganizations() {
        try {
            setIsLoading(true);
            const data = await getOrganizations();
            setOrganizations(data || []);
        } catch (err) {
            console.error("Failed to load organizations:", err);
            setError("Failed to load organizations");
        } finally {
            setIsLoading(false);
        }
    }

    function handleOpenModal(org?: Organization) {
        if (org) {
            setEditingOrg(org);
            setFormData({
                name: org.name,
                settings: JSON.stringify(org.settings, null, 2) || "{}",
            });
        } else {
            setEditingOrg(null);
            setFormData({ name: "", settings: "{}" });
        }
        setIsModalOpen(true);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        try {
            let settingsJson;
            try {
                settingsJson = JSON.parse(formData.settings);
            } catch (e) {
                setError("Invalid JSON in settings");
                return;
            }

            if (editingOrg) {
                await updateOrganization(editingOrg.id, {
                    name: formData.name,
                    settings: settingsJson,
                });
            } else {
                await createOrganization({
                    name: formData.name,
                    settings: settingsJson,
                });
            }

            setIsModalOpen(false);
            loadOrganizations();
        } catch (err) {
            console.error("Failed to save organization:", err);
            setError("Failed to save organization");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this organization?")) return;

        try {
            await deleteOrganization(id);
            loadOrganizations();
        } catch (err) {
            console.error("Failed to delete organization:", err);
            setError("Failed to delete organization");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Organizations
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Manage your organizations and their settings.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-x-4">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        New Organization
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
                ) : organizations.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                        <p>No organizations found. Create one to get started.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Name
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
                            {organizations.map((org) => (
                                <tr key={org.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {org.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(org.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(org)}
                                            className="text-indigo-400 hover:text-indigo-300 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(org.id)}
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
                                    {editingOrg ? "Edit Organization" : "New Organization"}
                                </h3>
                                <div className="mt-2">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-300">
                                                Name
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="settings" className="block text-sm font-medium leading-6 text-gray-300">
                                                Settings (JSON)
                                            </label>
                                            <div className="mt-2">
                                                <textarea
                                                    name="settings"
                                                    id="settings"
                                                    rows={4}
                                                    value={formData.settings}
                                                    onChange={(e) => setFormData({ ...formData, settings: e.target.value })}
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
