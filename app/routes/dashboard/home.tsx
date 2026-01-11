import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard - Verispect" },
    ];
}

export default function DashboardHome() {
    return (
        <div>
            <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                Dashboard
            </h1>
            <p className="mt-4 text-gray-400">
                Welcome to Verispect. Select an item from the sidebar to get started.
            </p>
        </div>
    );
}
