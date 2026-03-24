"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSiteSettings } from "@/app/providers";

type Consent = "accepted" | "essential" | null;

const STORAGE_KEY = "cookie_consent";
const EXPIRY_KEY = "cookie_consent_expiry";
const EXPIRY_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

function getStoredConsent(): Consent {
  if (typeof window === "undefined") return null;
  try {
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (expiry && Date.now() > Number(expiry)) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EXPIRY_KEY);
      return null;
    }
    return (localStorage.getItem(STORAGE_KEY) as Consent) ?? null;
  } catch {
    return null;
  }
}

function storeConsent(value: "accepted" | "essential") {
  try {
    localStorage.setItem(STORAGE_KEY, value);
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + EXPIRY_MS));
  } catch { /* ignore */ }
}

// ── GDPR Banner (EU) ──────────────────────────────────────────────────────────
function GdprBanner({ onAccept, onEssential, siteName }: {
  onAccept: () => void;
  onEssential: () => void;
  siteName: string;
}) {
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 md:bottom-6 md:left-6 md:right-auto md:max-w-md"
    >
      <div className="bg-white border border-gray-200 rounded-t-2xl md:rounded-2xl shadow-2xl p-6">
        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="font-bold text-gray-900 text-base">We value your privacy</h2>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          {siteName} uses cookies to enhance your experience and analyse site traffic. Essential cookies are
          always active. You can choose whether to accept optional analytics cookies.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onAccept}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Accept All Cookies
          </button>
          <button
            onClick={onEssential}
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Essential Cookies Only
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          <Link href="/cookies" className="hover:text-indigo-600 underline">Cookie Policy</Link>
          {" · "}
          <Link href="/privacy" className="hover:text-indigo-600 underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

// ── CCPA Notice (US) ──────────────────────────────────────────────────────────
function CcpaBanner({ onDismiss, onOptOut, siteName }: {
  onDismiss: () => void;
  onOptOut: () => void;
  siteName: string;
}) {
  return (
    <div
      role="banner"
      aria-label="Privacy notice"
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 justify-between">
        <p className="text-xs text-gray-300 leading-relaxed">
          {siteName} uses cookies for essential functions and optional analytics.{" "}
          <Link href="/cookies" className="text-indigo-400 hover:text-indigo-300 underline">Learn more</Link>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOptOut}
            className="text-xs text-gray-400 hover:text-white underline whitespace-nowrap transition-colors"
          >
            Do Not Sell My Info
          </button>
          <button
            onClick={onDismiss}
            className="bg-white text-gray-900 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            OK, Got It
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Global Notice ─────────────────────────────────────────────────────────────
function GlobalBanner({ onDismiss, siteName }: {
  onDismiss: () => void;
  siteName: string;
}) {
  return (
    <div
      role="banner"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 border-t border-gray-700"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 justify-between">
        <p className="text-xs text-gray-300">
          {siteName} uses cookies to improve your experience.{" "}
          <Link href="/cookies" className="text-teal-400 hover:text-teal-300 underline">Cookie Policy</Link>
          {" · "}
          <Link href="/privacy" className="text-teal-400 hover:text-teal-300 underline">Privacy Policy</Link>
        </p>
        <button
          onClick={onDismiss}
          className="bg-teal-600 text-white text-xs font-semibold px-5 py-2 rounded-lg hover:bg-teal-700 transition-colors shrink-0"
        >
          Got It
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function CookieBanner() {
  const settings = useSiteSettings();
  const region = settings.privacy_region || "EU";
  const siteName = settings.site_name;

  const [consent, setConsent] = useState<Consent | "loading">("loading");

  // Only read localStorage after hydration
  useEffect(() => {
    setConsent(getStoredConsent());
  }, []);

  // Listen for the "open-cookie-settings" event fired from the cookies page button
  useEffect(() => {
    function handleOpen() { setConsent(null); }
    document.addEventListener("open-cookie-settings", handleOpen);
    return () => document.removeEventListener("open-cookie-settings", handleOpen);
  }, []);

  // Wire up the static button on /cookies page that has data-action="open-cookie-settings"
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const el = (e.target as Element).closest("[data-action='open-cookie-settings']");
      if (el) {
        e.preventDefault();
        setConsent(null);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const accept = () => { storeConsent("accepted"); setConsent("accepted"); };
  const essential = () => { storeConsent("essential"); setConsent("essential"); };

  // Still loading or user already made a choice — nothing to show
  if (consent === "loading" || consent !== null) return null;

  if (region === "EU") {
    return <GdprBanner onAccept={accept} onEssential={essential} siteName={siteName} />;
  }

  if (region === "US") {
    return (
      <CcpaBanner
        onDismiss={accept}
        onOptOut={essential}
        siteName={siteName}
      />
    );
  }

  return <GlobalBanner onDismiss={accept} siteName={siteName} />;
}
