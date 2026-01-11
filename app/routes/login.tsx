import type { Route } from "./+types/login";
import { Form, Link, redirect } from "react-router";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Login - Verispect" },
        { name: "description", content: "Login to Verispect" },
    ];
}

export async function action({ request }: Route.ActionArgs) {
    // TODO: Implement actual login logic
    return redirect("/dashboard");
}

export default function Login() {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Verispect</h1>
                    <p className="text-gray-400">Sign in to your account</p>
                </div>

                <Form method="post" className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500 transition-colors"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-700 rounded bg-gray-800"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 block text-sm text-gray-400"
                            >
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link
                                to="/forgot-password"
                                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                    >
                        Sign in
                    </button>
                </Form>
            </div>
        </div>
    );
}
