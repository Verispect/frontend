import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration is sourced from Vite environment variables.
// Make sure these are defined in your `.env` file (see `.env.example`).
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Reuse existing app instance if it was already initialized (avoids SSR/fast-refresh issues).
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export the Firebase Auth instance and a Google provider for SSO.
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Optional: force account selection on each Google sign-in to make testing easier.
googleProvider.setCustomParameters({
    prompt: "select_account",
});