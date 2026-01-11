import type { Route } from "./+types/users";
import { useEffect, useState } from "react";
import { createUser, deleteUser, getUsers, updateUser } from "~/lib/api";
import type { User, UserRole } from "~/types/api";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Users - Verispect" }];
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        email: "",
        org_id: "",
        role: "inspector" as UserRole,
        password: "",
    });

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setIsLoading(true);
            const data = await getUsers();
            setUsers(data || []);
        } catch (err) {
            console.error("Failed to load users:", err);
            setError("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }

    function handleOpenModal(user?: User) {
        if (user) {
            setEditingUser(user);
            setFormData({
                email: user.email,
                org_id: user.org_id,
                role: user.role,
                password: "", // Don't show existing password
            });
        } else {
            setEditingUser(null);
            setFormData({
                email: "",
                org_id: "",
                role: "inspector",
                password: "",
            });
        }
        setIsModalOpen(true);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        try {
            if (editingUser) {
                // Remove password if empty (or handle separately if API supports it, here we assume update doesn't change password easily or ignores it if not provided in specific endpoint, but client helper takes Partial<User>. Let's strict to Partial<User> which doesn't have password. The type in api.ts for User doesn't have password. The createUser helper has & { password?: string }. So we can't update password here easily unless we change the API helper or type. I'll skip password update for now.)
                await updateUser(editingUser.id, {
                    email: formData.email,
                    org_id: formData.org_id,
                    role: formData.role,
                });
            } else {
                if (!formData.password) {
                    setError("Password is required for new users");
                    return;
                }
                await createUser({
                    email: formData.email,
                    org_id: formData.org_id,
                    role: formData.role,
                    password: formData.password,
                });
            }

            setIsModalOpen(false);
            loadUsers();
        } catch (err) {
            console.error("Failed to save user:", err);
            setError("Failed to save user");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            await deleteUser(id);
            loadUsers();
        } catch (err) {
            console.error("Failed to delete user:", err);
            setError("Failed to delete user");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Users
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Manage users and their permissions.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-x-4">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        New User
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
                ) : users.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                        <p>No users found. Create one to get started.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Org ID
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-gray-900">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${user.role === 'admin' ? 'bg-purple-400/10 text-purple-400 ring-purple-400/30' :
                                                user.role === 'manager' ? 'bg-blue-400/10 text-blue-400 ring-blue-400/30' :
                                                    'bg-green-400/10 text-green-400 ring-green-400/30'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                        {user.org_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(user)}
                                            className="text-indigo-400 hover:text-indigo-300 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
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
                                    {editingUser ? "Edit User" : "New User"}
                                </h3>
                                <div className="mt-2">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-300">
                                                Email
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="org_id" className="block text-sm font-medium leading-6 text-gray-300">
                                                Organization ID
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="org_id"
                                                    id="org_id"
                                                    required
                                                    value={formData.org_id}
                                                    onChange={(e) => setFormData({ ...formData, org_id: e.target.value })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-300">
                                                Role
                                            </label>
                                            <div className="mt-2">
                                                <select
                                                    id="role"
                                                    name="role"
                                                    required
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                                    className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                >
                                                    <option value="manager">Manager</option>
                                                    <option value="inspector">Inspector</option>
                                                    <option value="cleaner">Cleaner</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        </div>

                                        {!editingUser && (
                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-300">
                                                    Password
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        id="password"
                                                        required
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        className="block w-full rounded-md border-0 bg-gray-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                    />
                                                </div>
                                            </div>
                                        )}

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
