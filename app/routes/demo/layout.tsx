import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { Sidebar } from "~/components/ui/Sidebar";
import { getDemoRole, setDemoRole } from "~/lib/demo-context";
import type { UserRole } from "~/types/api";
import { canAccess } from "~/lib/role-permissions";

const ROLES: { value: UserRole; label: string }[] = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "inspector", label: "Inspector" },
    { value: "cleaner", label: "Cleaner" },
];

function DemoUserAvatar({
    role,
    onRoleChange,
}: {
    role: UserRole;
    onRoleChange: (role: UserRole) => void;
}) {
    const [open, setOpen] = useState(false);
    const displayName = `Demo (${role})`;
    const initials = role.slice(0, 2).toUpperCase();

    const handleSelect = useCallback(
        (r: UserRole) => {
            setDemoRole(r);
            onRoleChange(r);
            setOpen(false);
        },
        [onRoleChange]
    );

    return (
        <div className="relative flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:inline truncate max-w-[120px]">
                {displayName}
            </span>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                    aria-expanded={open}
                    aria-haspopup="true"
                >
                    <div
                        className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-300 ring-2 ring-gray-600"
                        title={displayName}
                    >
                        {initials}
                    </div>
                    <svg
                        className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {open && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            aria-hidden="true"
                            onClick={() => setOpen(false)}
                        />
                        <div
                            className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            role="menu"
                        >
                            <span className="block px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Switch role
                            </span>
                            {ROLES.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => handleSelect(r.value)}
                                    className="flex w-full items-center justify-between px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-700 hover:text-white"
                                    role="menuitem"
                                >
                                    {r.label}
                                    {role === r.value && (
                                        <svg className="h-4 w-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function DemoLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [role, setRole] = useState<UserRole>(() => getDemoRole());

    // Sync role from localStorage (e.g. after navigation from try-demo with query)
    useEffect(() => {
        setRole(getDemoRole());
    }, [location.pathname]);

    const handleRoleChange = useCallback(
        (newRole: UserRole) => {
            setRole(newRole);
            const path = location.pathname;
            if (!canAccess(newRole, path)) {
                navigate("/demo", { replace: true });
            }
        },
        [location.pathname, navigate]
    );

    useEffect(() => {
        const path = location.pathname;
        if (!canAccess(role, path)) {
            navigate("/demo", { replace: true });
        }
    }, [role, location.pathname, navigate]);

    return (
        <div className="min-h-screen bg-gray-950">
            <Sidebar role={role} basePath="/demo" isDemo={true} />
            <div className="lg:pl-72">
                <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-800 bg-gray-950/95 backdrop-blur px-4 sm:gap-x-6 sm:px-6 lg:px-8">
                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6" />
                    <div className="flex items-center gap-x-4 lg:gap-x-6">
                        <DemoUserAvatar role={role} onRoleChange={handleRoleChange} />
                        <Link
                            to="/try-demo"
                            className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Back to demo
                        </Link>
                    </div>
                </header>
                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
