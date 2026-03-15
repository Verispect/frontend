import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/image-analysis";
import logoLight from "../welcome/logo.jpg";
import { analyzeImage } from "~/lib/api";
import { ApiError } from "~/lib/api/client";
import type { ImageAnalysisPlace, ImageAnalysisResponse } from "~/types/api";

const gradientBar =
  "linear-gradient(90deg, #2a69b7 0%, #3a7fc4 40%, #4ba880 100%)";

const placeOptions: Array<{ value: ImageAnalysisPlace; label: string }> = [
  { value: "bathroom", label: "Bathroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bedroom", label: "Bedroom" },
  { value: "living_room", label: "Living room" },
  { value: "hallway", label: "Hallway" },
  { value: "lobby", label: "Lobby" },
  { value: "office", label: "Office" },
  { value: "dining_room", label: "Dining room" },
  { value: "laundry_room", label: "Laundry room" },
];

type SubmitState = "idle" | "uploading" | "success" | "error";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Image Analysis | Verispect" },
    {
      name: "description",
      content:
        "Upload a photo for instant cleaning and maintenance task suggestions.",
    },
  ];
}

export default function ImageAnalysisPage() {
  const [email, setEmail] = useState("");
  const [place, setPlace] = useState<ImageAnalysisPlace | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }
    const nextUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [selectedFile]);

  const isSubmitting = submitState === "uploading";

  const canSubmit = useMemo(
    () => Boolean(email.trim() && place && selectedFile && !isSubmitting),
    [email, place, selectedFile, isSubmitting],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !place || !selectedFile) {
      setSubmitState("error");
      setErrorMessage("Please add an email, select a place, and choose a photo.");
      return;
    }

    setSubmitState("uploading");
    setErrorMessage("");
    setResult(null);

    const body = new FormData();
    body.append("image", selectedFile);
    body.append("email", email.trim());
    body.append("place", place);

    try {
      const response = await analyzeImage(body);
      setResult(response);
      setSubmitState("success");
    } catch (err) {
      setSubmitState("error");
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setErrorMessage("Invalid upload data. Check your photo, email, and place.");
        } else if (err.status === 503) {
          setErrorMessage("Image analysis is temporarily unavailable. Please try again.");
        } else {
          setErrorMessage("Could not analyze this image right now. Please try again.");
        }
      } else {
        setErrorMessage("Could not analyze this image right now. Please try again.");
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
              <img src={logoLight} alt="Verispect" className="block h-5 dark:hidden" />
              <img src={logoLight} alt="Verispect" className="hidden h-5 dark:block" />
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

      <section className="px-4 py-8 pb-28 md:py-12 md:pb-12">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Upload a photo
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Send one image and get suggested cleaning and maintenance tasks.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2a69b7] disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:ring-[#4ba880]"
              />
            </div>

            <div>
              <p className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Place
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {placeOptions.map((option) => {
                  const checked = place === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-medium transition ${
                        checked
                          ? "border-transparent text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                      }`}
                      style={checked ? { background: gradientBar } : undefined}
                    >
                      <input
                        type="radio"
                        name="place"
                        value={option.value}
                        checked={checked}
                        disabled={isSubmitting}
                        onChange={() => setPlace(option.value)}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Photo
              </p>
              <label
                htmlFor="image"
                className="block cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-white p-4 text-center transition hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-500"
              >
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tap to take or choose a photo
                </span>
                <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG, WEBP up to 10MB
                </span>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={isSubmitting}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="sr-only"
                  required
                />
              </label>
              {selectedFile && (
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {previewUrl && (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <img
                  src={previewUrl}
                  alt="Selected upload preview"
                  className="h-64 w-full object-cover"
                />
              </div>
            )}

            {submitState === "uploading" && (
              <div
                className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700 dark:border-blue-700 dark:border-t-blue-200" />
                  <span>Analyzing photo...</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-blue-200/80 dark:bg-blue-800/60" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-blue-200/80 dark:bg-blue-800/60" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-blue-200/80 dark:bg-blue-800/60" />
                </div>
              </div>
            )}

            {submitState === "error" && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95 md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-xl px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: gradientBar }}
              >
                {isSubmitting ? "Analyzing..." : "Analyze photo"}
              </button>
            </div>
          </form>

          {submitState === "success" && result && (
            <section
              className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40"
              aria-live="polite"
            >
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Analysis complete for {result.place.replace("_", " ")}.
              </p>
              {result.tasks.length === 0 ? (
                <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                  No tasks were returned for this image.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {result.tasks.map((task, index) => (
                    <li
                      key={`${task.description}-${index}`}
                      className="rounded-xl border border-green-200 bg-white p-3 dark:border-green-900 dark:bg-gray-900"
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {task.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-indigo-100 px-2 py-1 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {task.type}
                        </span>
                        <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          {task.priority}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {task.area}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
