import type { Route } from "./+types/evidence";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Evidence - Verispect" }];
}

export default function Evidence() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Evidence
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Manage evidence items collected during inspections.
                    </p>
                </div>
        // No create button by default for evidence, likely created within inspection context, but for consistency:
                <div className="flex shrink-0 items-center gap-x-4">
                    {/* Contextual action usually */}
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="p-6 text-center text-gray-400">
                    <p>Select an inspection to view evidence.</p>
                </div>
            </div>
        </div>
    );
}
