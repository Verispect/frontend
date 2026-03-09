import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/try-demo";
import logoLight from "../welcome/logo.jpg";
import { bookDemo } from "~/lib/api";
import { ApiError } from "~/lib/api/client";
import { auth } from "~/firebase";

const gradientBar =
  "linear-gradient(90deg, #2a69b7 0%, #3a7fc4 40%, #4ba880 100%)";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Book Demo | Verispect" },
    {
      name: "description",
      content: "Request a personalized Verispect demo. We'll reach out to schedule a call.",
    },
  ];
}

export default function TryDemo() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user?.email) setEmail(user.email);
  }, []);

  async function handleBookDemoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMessage("");
    try {
      await bookDemo(email.trim());
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError && err.status === 401) {
        setErrorMessage("Please sign in to book a demo.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f6] dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div
              className="flex h-9 items-center rounded-lg px-3"
              style={{ background: gradientBar }}
            >
              <img
                src={logoLight}
                alt="Verispect"
                className="h-5 block dark:hidden"
              />
              <img
                src={logoLight}
                alt="Verispect"
                className="h-5 hidden dark:block"
              />
            </div>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </header>

      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Book a demo
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Request a personalized demo. We'll reach out to schedule a call.
          </p>

          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
            onSubmit={handleBookDemoSubmit}
          >
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2a69b7] dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:ring-[#4ba880] sm:max-w-sm disabled:opacity-70"
              required
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-xl px-6 py-3 font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-70 sm:flex-shrink-0"
              style={{ background: gradientBar }}
            >
              {status === "loading" ? "Booking…" : "Book demo"}
            </button>
          </form>

          {status === "success" && (
            <p className="mt-3 text-sm font-medium text-green-600 dark:text-green-400">
              Thanks! We'll be in touch to schedule your demo.
            </p>
          )}
          {status === "error" && (
            <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400" role="alert">
              {errorMessage}
              {errorMessage.includes("sign in") && (
                <>{" "}
                  <Link to="/login" className="underline hover:no-underline">
                    Sign in
                  </Link>
                </>
              )}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
