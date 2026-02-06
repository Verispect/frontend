import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
    return [{ title: "Demo - Verispect" }];
}

export default function DemoHome() {
    return (
        <div>
            <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                Demo
            </h1>
            <p className="mt-4 text-gray-400">
                Welcome to the Verispect demo. Use the role switcher on your avatar to change roles. Select an item from the sidebar to explore.
            </p>
        </div>
    );
}
