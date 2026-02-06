import type { Route } from "./+types/choose-role";
import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import type { UserRole } from "~/types/api";
import { getStoredUser, saveUserToStorage } from "~/lib/user-session";
import { updateUser } from "~/lib/api";

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Full access to all areas including organizations and user management." },
  { value: "manager", label: "Manager", description: "Access to users, inspections, evidence, reports and tasks. No organizations." },
  { value: "inspector", label: "Inspector", description: "Access to inspections, evidence, reports and tasks." },
  { value: "cleaner", label: "Cleaner", description: "Access to tasks and evidence only." },
];

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Choose your role - Verispect" },
    { name: "description", content: "Select your role" },
  ];
}

export default function ChooseRole() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user?.role && !(location.state as { isNewUser?: boolean })?.isNewUser) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const user = getStoredUser();
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      const updated = await updateUser(user.id, { role: selected });
      saveUserToStorage(updated);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Failed to save role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const user = getStoredUser();
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Choose your role</h1>
      <p className="mt-2 text-gray-400">
        Select the role that best matches your responsibilities. You can change this later from your profile.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {ROLES.map((role) => (
          <label
            key={role.value}
            className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors ${
              selected === role.value
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-gray-700 bg-gray-900/50 hover:border-gray-600"
            }`}
          >
            <input
              type="radio"
              name="role"
              value={role.value}
              checked={selected === role.value}
              onChange={() => setSelected(role.value)}
              className="mt-1 h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-600"
            />
            <div>
              <span className="font-medium text-white">{role.label}</span>
              <p className="mt-1 text-sm text-gray-400">{role.description}</p>
            </div>
          </label>
        ))}
        <button
          type="submit"
          disabled={!selected || loading}
          className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Continue to dashboard"}
        </button>
      </form>
    </div>
  );
}
