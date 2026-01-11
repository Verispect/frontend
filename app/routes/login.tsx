import type { Route } from "./+types/login";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Login - Verispect" },
        { name: "description", content: "Login to Verispect" },
    ];
}

export default function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/dashboard");
        } catch (err: any) {
            console.error("Login error:", err);
            setError("Invalid email or password. Please try again.");
            if (err.code === 'auth/invalid-credential') {
                setError("Invalid email or password.");
            } else if (err.code === 'auth/user-not-found') {
                setError("No user found with this email.");
            } else if (err.code === 'auth/wrong-password') {
                setError("Incorrect password.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Verispect</h1>
                    <p className="text-gray-400">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
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
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
