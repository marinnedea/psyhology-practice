"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

type Props = {
  recaptchaSiteKey: string;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export default function LoginForm({ recaptchaSiteKey }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const recaptchaEnabled = recaptchaSiteKey.trim() !== "";

  // Load the reCAPTCHA script and render the widget when the site key is set
  useEffect(() => {
    if (!recaptchaEnabled) return;

    function renderWidget() {
      if (!recaptchaContainerRef.current) return;
      if (widgetIdRef.current !== null) return; // already rendered
      widgetIdRef.current = window.grecaptcha.render(recaptchaContainerRef.current, {
        sitekey: recaptchaSiteKey,
        callback: (token: string) => {
          setRecaptchaToken(token);
        },
        "expired-callback": () => {
          setRecaptchaToken("");
        },
        "error-callback": () => {
          setRecaptchaToken("");
        },
      });
      setRecaptchaReady(true);
    }

    if (typeof window.grecaptcha !== "undefined" && window.grecaptcha.render) {
      renderWidget();
      return;
    }

    // Script not yet loaded — set up the onload callback
    window.onRecaptchaLoad = renderWidget;

    const existing = document.querySelector(
      'script[src*="recaptcha/api.js"]'
    );
    if (!existing) {
      const script = document.createElement("script");
      script.src =
        "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [recaptchaEnabled, recaptchaSiteKey]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (recaptchaEnabled && !recaptchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      ...(recaptchaEnabled ? { recaptchaToken } : {}),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        result.error === "reCAPTCHA verification failed"
          ? "reCAPTCHA verification failed. Please try again."
          : "Invalid email or password"
      );
      // Reset the reCAPTCHA widget so the user can try again
      if (recaptchaEnabled && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
        setRecaptchaToken("");
      }
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Sign In
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {recaptchaEnabled && (
            <div className="flex flex-col items-start gap-2">
              <div ref={recaptchaContainerRef} />
              {!recaptchaReady && (
                <p className="text-xs text-gray-400">Loading reCAPTCHA...</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (recaptchaEnabled && !recaptchaToken)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
