import { Link } from "react-router";
import type { Route } from "./+types/try-demo";
import logoLight from "../welcome/logo.jpg";

const gradientBar =
  "linear-gradient(90deg, #2a69b7 0%, #3a7fc4 40%, #4ba880 100%)";

const roles = [
  {
    id: "manager",
    title: "Try as Manager",
    description:
      "Create inspection templates, assign inspections, review reports, and track team productivity.",
    href: "/dashboard?demo=manager",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    id: "inspector",
    title: "Try as Inspector",
    description:
      "Capture photos and notes, trigger AI analysis, and generate shareable reports.",
    href: "/dashboard?demo=inspector",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 13v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7"
        />
      </svg>
    ),
  },
  {
    id: "cleaner",
    title: "Try as Cleaner",
    description:
      "View assigned tasks, upload before/after photos, and mark tasks complete with evidence.",
    href: "/dashboard?demo=cleaner",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
] as const;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Try Demo | Verispect" },
    {
      name: "description",
      content:
        "Try Verispect as Manager, Inspector, or Cleaner. No login required.",
    },
  ];
}

export default function TryDemo() {
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
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Try Verispect
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Choose a role to explore the product with demo data. No signup
            required.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Link
              key={role.id}
              to={role.href}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-[#2a69b7]/50 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-[#4ba880]/50"
            >
              <div
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-[#2a69b7] dark:text-[#4ba880]"
                style={{
                  background: "linear-gradient(135deg, #2a69b720 0%, #4ba88020 100%)",
                }}
              >
                {role.icon}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {role.title}
              </h2>
              <p className="mt-2 flex-1 text-sm text-gray-600 dark:text-gray-400">
                {role.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#2a69b7] group-hover:underline dark:text-[#4ba880]">
                Enter demo
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
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
              </span>
            </Link>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-gray-500 dark:text-gray-400">
          Demo uses sample data. You can explore inspections, evidence, and
          reports without creating an account.
        </p>
      </section>
    </main>
  );
}
