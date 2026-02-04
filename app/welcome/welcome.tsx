import { useState } from "react";
import { Link } from "react-router";
import { joinWaitingList } from "~/lib/api";
import logoLight from "./logo.jpg";

const gradientBar =
  "linear-gradient(90deg, #2a69b7 0%, #3a7fc4 40%, #4ba880 100%)";

export function Welcome() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMessage("");
    try {
      await joinWaitingList(email.trim());
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f6] dark:bg-gray-950">
      {/* Top bar with logo */}
      <header className="sticky top-0 z-10 border-b border-gray-200/80 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
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
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Inspection & evidence automation
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              to="/try-demo"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Try Demo
            </Link>
            <a
              href="#waitlist"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-95"
              style={{ background: gradientBar }}
            >
              Join Waitlist
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.12]"
          style={{
            background: gradientBar,
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            Independent verification for maintenance and contractor work on physical assets
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 md:text-xl">
            We help asset managers make defensible payment decisions without unnecessary site inspections.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/try-demo"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl sm:w-auto"
              style={{ background: gradientBar }}
            >
              Try demo
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <a
              href="#waitlist"
              className="inline-flex w-full items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-6 py-3.5 text-base font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-800 sm:w-auto"
            >
              Join waitlist
            </a>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-t border-gray-200 bg-white px-4 py-16 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Built for how you work
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AI-powered reports",
                desc: "Per-photo analysis and structured reports so you spend less time writing and more time inspecting.",
              },
              {
                title: "Evidence that sticks",
                desc: "Before/after photos, notes, and task proof in one place—dispute-proof and export-ready.",
              },
              {
                title: "Try before you sign up",
                desc: "Try as Manager, Inspector, or Cleaner with demo data. No credit card, no commitment.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section
        id="waitlist"
        className="border-t border-gray-200 px-4 py-20 dark:border-gray-800"
      >
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Join the waitlist
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Get early access and product updates. No spam.
          </p>
          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
            onSubmit={handleWaitlistSubmit}
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
              {status === "loading" ? "Joining…" : "Join waitlist"}
            </button>
          </form>
          {status === "success" && (
            <p className="mt-3 text-sm font-medium text-green-600 dark:text-green-400">
              You’re on the list. We’ll be in touch.
            </p>
          )}
          {status === "error" && (
            <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      </section>

      {/* Try demo CTA */}
      <section className="border-t border-gray-200 bg-white px-4 py-16 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            See it in action
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Try Verispect as Manager, Inspector, or Cleaner with sample data. No
            login required.
          </p>
          <Link
            to="/try-demo"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white transition-opacity hover:opacity-95"
            style={{ background: gradientBar }}
          >
            Try demo
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 px-4 py-8 dark:border-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>© {new Date().getFullYear()} Verispect</span>
          <Link
            to="/try-demo"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Try demo
          </Link>
        </div>
      </footer>
    </main>
  );
}
