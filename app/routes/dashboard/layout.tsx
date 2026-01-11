import { Outlet } from "react-router";
import { Sidebar } from "~/components/ui/Sidebar";

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-gray-950">
            <Sidebar />
            <div className="lg:pl-72">
                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
