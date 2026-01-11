import type { Route } from "./+types/tasks";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Tasks - Verispect" }];
}

export default function Tasks() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Tasks
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Manage tasks assigned to inspections or users.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-x-4">
                    <Link
                        to="new"
                        className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        New Task
                    </Link>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="p-6 text-center text-gray-400">
                    <p>No tasks found.</p>
                </div>
            </div>
        </div>
    );
}
