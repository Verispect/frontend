import { NavLink } from "react-router";
import type { UserRole } from "~/types/api";
import { canAccess } from "~/lib/role-permissions";

const DASHBOARD_PATH = "/dashboard";
const navigation = [
    { name: "Dashboard", href: DASHBOARD_PATH, icon: "LayoutDashboard" },
    { name: "Users", href: "/dashboard/users", icon: "Users" },
    { name: "Inspections", href: "/dashboard/inspections", icon: "ClipboardCheck" },
    { name: "Evidence", href: "/dashboard/evidence", icon: "FileSearch" },
    { name: "Reports", href: "/dashboard/reports", icon: "FileText" },
    { name: "Tasks", href: "/dashboard/tasks", icon: "ListTodo" },
];

export function Sidebar({ role, basePath = DASHBOARD_PATH, isDemo = false }: { role: UserRole; basePath?: string; isDemo?: boolean }) {
    const visibleNav = navigation.filter((item) => canAccess(role, item.href)).map((item) => ({
        ...item,
        href: item.href.replace(DASHBOARD_PATH, basePath),
    }));

    if (!isDemo) {
        visibleNav.unshift({ name: "Organizations", href: "/dashboard/organizations", icon: "Building2" });
    }

    return (
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-800 bg-gray-900 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                    <span className="text-xl font-bold text-white tracking-tight">Verispect</span>
                </div>
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {visibleNav.map((item) => (
                                    <li key={item.name}>
                                        <NavLink
                                            to={item.href}
                                            end={item.href === basePath}
                                            className={({ isActive }) =>
                                                `group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors ${isActive
                                                    ? "bg-gray-800 text-white"
                                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                                }`
                                            }
                                        >
                                            {/* Icons would go here, simplified for now */}
                                            <span className="truncate">{item.name}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}
