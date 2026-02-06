import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User, signOut } from "firebase/auth";
import { auth } from "~/firebase";
import { Sidebar } from "~/components/ui/Sidebar";
import { getStoredUser, saveUserToStorage, clearStoredUser } from "~/lib/user-session";
import { signUpUser } from "~/lib/api";
import type { User as AppUser } from "~/types/api";
import { canAccess } from "~/lib/role-permissions";

function UserAvatar({ user }: { user: User }) {
    const displayName = user.displayName ?? user.email ?? "User";
    const initials = displayName
        .split(/\s+/)
        .map((s) => s[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:inline truncate max-w-[120px]">
                {displayName}
            </span>
            {user.photoURL ? (
                <img
                    src={user.photoURL}
                    alt={displayName}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-700"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div
                    className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-300 ring-2 ring-gray-600"
                    title={displayName}
                >
                    {initials}
                </div>
            )}
        </div>
    );
}

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [authChecking, setAuthChecking] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setAuthChecking(false);
            if (u) {
                setUser(u);
            } else {
                navigate("/login", { replace: true });
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        const stored = getStoredUser();
        if (stored) {
            setAppUser(stored);
            return;
        }
        signUpUser()
            .then(({ user: u }) => {
                saveUserToStorage(u);
                setAppUser(u);
            })
            .catch(() => setAppUser(null));
    }, [user]);

    const handleSignOut = () => {
        clearStoredUser();
        signOut(auth);
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        if (!appUser) return;
        const path = location.pathname;
        if (path === "/dashboard/choose-role") return;
        if (!canAccess(appUser.role, path)) {
            navigate("/dashboard", { replace: true });
        }
    }, [appUser, location.pathname, navigate]);

    if (authChecking || (user && !appUser)) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Sidebar role={appUser!.role} />
            <div className="lg:pl-72">
                <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-800 bg-gray-950/95 backdrop-blur px-4 sm:gap-x-6 sm:px-6 lg:px-8">
                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6" />
                    <div className="flex items-center gap-x-4 lg:gap-x-6">
                        {user && <UserAvatar user={user} />}
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Sign out
                        </button>
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
