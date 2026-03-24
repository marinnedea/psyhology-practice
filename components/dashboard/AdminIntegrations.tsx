"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = {
  initialSettings: SiteSettings;
  recaptchaSecretKey: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusBadge({ configured }: { configured: boolean }) {
  return configured ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
      Configured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 inline-block" />
      Not configured
    </span>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    // eye-off
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    // eye
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
        tabIndex={-1}
        aria-label={show ? "Hide" : "Show"}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

function SaveButton({ status, onClick }: { status: SaveStatus; onClick: () => void }) {
  const label =
    status === "saving"
      ? "Saving..."
      : status === "saved"
      ? "Saved!"
      : status === "error"
      ? "Error — retry"
      : "Save";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status === "saving"}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        status === "saved"
          ? "bg-green-600 text-white hover:bg-green-700"
          : status === "error"
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {label}
    </button>
  );
}

async function saveSettings(data: Record<string, string>): Promise<void> {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to save");
  }
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {badge}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AdminIntegrations({
  initialSettings,
  recaptchaSecretKey: initialRecaptchaSecretKey,
}: Props) {
  // TinyMCE
  const [tinymceKey, setTinymceKey] = useState(initialSettings.tinymce_api_key);
  const [tinymceStatus, setTinymceStatus] = useState<SaveStatus>("idle");

  // reCAPTCHA
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState(
    initialSettings.recaptcha_site_key
  );
  const [recaptchaSecretKey, setRecaptchaSecretKey] = useState(
    initialRecaptchaSecretKey
  );
  const [recaptchaStatus, setRecaptchaStatus] = useState<SaveStatus>("idle");

  // Google Analytics
  const [gaId, setGaId] = useState(initialSettings.ga_measurement_id);
  const [gaStatus, setGaStatus] = useState<SaveStatus>("idle");

  // Unsplash
  const [unsplashKey, setUnsplashKey] = useState(initialSettings.unsplash_access_key);
  const [unsplashStatus, setUnsplashStatus] = useState<SaveStatus>("idle");

  // ---------------------------------------------------------------------------
  // Save handlers
  // ---------------------------------------------------------------------------

  async function handleSaveTinymce() {
    setTinymceStatus("saving");
    try {
      await saveSettings({ tinymce_api_key: tinymceKey });
      setTinymceStatus("saved");
      setTimeout(() => setTinymceStatus("idle"), 2500);
    } catch {
      setTinymceStatus("error");
      setTimeout(() => setTinymceStatus("idle"), 3000);
    }
  }

  async function handleSaveRecaptcha() {
    setRecaptchaStatus("saving");
    try {
      await saveSettings({
        recaptcha_site_key: recaptchaSiteKey,
        recaptcha_secret_key: recaptchaSecretKey,
      });
      setRecaptchaStatus("saved");
      setTimeout(() => setRecaptchaStatus("idle"), 2500);
    } catch {
      setRecaptchaStatus("error");
      setTimeout(() => setRecaptchaStatus("idle"), 3000);
    }
  }

  async function handleSaveGa() {
    setGaStatus("saving");
    try {
      await saveSettings({ ga_measurement_id: gaId });
      setGaStatus("saved");
      setTimeout(() => setGaStatus("idle"), 2500);
    } catch {
      setGaStatus("error");
      setTimeout(() => setGaStatus("idle"), 3000);
    }
  }

  async function handleSaveUnsplash() {
    setUnsplashStatus("saving");
    try {
      await saveSettings({ unsplash_access_key: unsplashKey });
      setUnsplashStatus("saved");
      setTimeout(() => setUnsplashStatus("idle"), 2500);
    } catch {
      setUnsplashStatus("error");
      setTimeout(() => setUnsplashStatus("idle"), 3000);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 max-w-2xl">
      {/* TinyMCE */}
      <Section
        title="TinyMCE Rich Text Editor"
        badge={<StatusBadge configured={tinymceKey.trim() !== ""} />}
      >
        <div className="space-y-1">
          <label htmlFor="tinymce_api_key" className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <PasswordInput
            id="tinymce_api_key"
            value={tinymceKey}
            onChange={setTinymceKey}
            placeholder="Enter your TinyMCE API key"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get your free API key at{" "}
            <a
              href="https://www.tiny.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              tiny.cloud
            </a>
          </p>
        </div>
        <div className="flex justify-end">
          <SaveButton status={tinymceStatus} onClick={handleSaveTinymce} />
        </div>
      </Section>

      {/* reCAPTCHA */}
      <Section
        title="Google reCAPTCHA v2"
        badge={
          <StatusBadge
            configured={recaptchaSiteKey.trim() !== "" && recaptchaSecretKey.trim() !== ""}
          />
        }
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="recaptcha_site_key" className="block text-sm font-medium text-gray-700">
              Site Key
            </label>
            <input
              id="recaptcha_site_key"
              type="text"
              value={recaptchaSiteKey}
              onChange={(e) => setRecaptchaSiteKey(e.target.value)}
              placeholder="6Le..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="recaptcha_secret_key" className="block text-sm font-medium text-gray-700">
              Secret Key
            </label>
            <PasswordInput
              id="recaptcha_secret_key"
              value={recaptchaSecretKey}
              onChange={setRecaptchaSecretKey}
              placeholder="6Le..."
            />
          </div>
          <p className="text-xs text-gray-500">
            Register at{" "}
            <a
              href="https://www.google.com/recaptcha"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              google.com/recaptcha
            </a>
            . When both keys are set, a reCAPTCHA checkbox will appear on the login form.
          </p>
        </div>
        <div className="flex justify-end">
          <SaveButton status={recaptchaStatus} onClick={handleSaveRecaptcha} />
        </div>
      </Section>

      {/* Google Analytics */}
      <Section
        title="Google Analytics 4"
        badge={<StatusBadge configured={gaId.trim() !== ""} />}
      >
        <div className="space-y-1">
          <label htmlFor="ga_measurement_id" className="block text-sm font-medium text-gray-700">
            Measurement ID
          </label>
          <input
            id="ga_measurement_id"
            type="text"
            value={gaId}
            onChange={(e) => setGaId(e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            Find this in your GA4 property settings under Data Streams.
          </p>
        </div>
        <div className="flex justify-end">
          <SaveButton status={gaStatus} onClick={handleSaveGa} />
        </div>
      </Section>

      {/* Unsplash */}
      <Section
        title="Unsplash Image Search"
        badge={<StatusBadge configured={unsplashKey.trim() !== ""} />}
      >
        <div className="space-y-1">
          <label htmlFor="unsplash_access_key" className="block text-sm font-medium text-gray-700">
            Access Key
          </label>
          <PasswordInput
            id="unsplash_access_key"
            value={unsplashKey}
            onChange={setUnsplashKey}
            placeholder="Enter your Unsplash access key"
          />
          <p className="text-xs text-gray-500 mt-1">
            Register at{" "}
            <a
              href="https://unsplash.com/developers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              unsplash.com/developers
            </a>
            . Used for searching stock photos.
          </p>
        </div>
        <div className="flex justify-end">
          <SaveButton status={unsplashStatus} onClick={handleSaveUnsplash} />
        </div>
      </Section>
    </div>
  );
}
