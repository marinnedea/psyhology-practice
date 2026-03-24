"use client";

import Link from "next/link";
import { useState } from "react";
import { useSiteSettings } from "@/app/providers";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const { site_name, footer_credits } = useSiteSettings();

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("Thank you for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter bar */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-xl font-semibold">Stay informed</h3>
            <p className="text-blue-100 text-sm mt-1">
              Get expert mental health tips and updates in your inbox.
            </p>
          </div>
          <form onSubmit={handleNewsletter} className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={status === "loading" || status === "success"}
              className="flex-1 md:w-64 px-4 py-2 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="bg-white text-blue-700 px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        </div>
        {(status === "success" || status === "error") && (
          <div className={`text-center pb-3 text-sm font-medium ${status === "success" ? "text-green-200" : "text-red-200"}`}>
            {message}
          </div>
        )}
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="8" cy="22" r="5" fill="white" />
                <circle cx="24" cy="22" r="5" fill="white" />
                <path d="M3 22 Q16 4 29 22" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
              <span className="text-white text-xl font-semibold">{site_name}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Connecting people with qualified mental health professionals for a
              healthier, happier life.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services" className="hover:text-white transition-colors">All Services</Link></li>
              <li><Link href="/psychologists" className="hover:text-white transition-colors">Find a Psychologist</Link></li>
              <li><Link href="/register?role=CLIENT" className="hover:text-white transition-colors">Book an Appointment</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Professionals</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register?role=PSYCHOLOGIST" className="hover:text-white transition-colors">Join as a Psychologist</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Psychologist Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© {new Date().getFullYear()} {site_name}. All rights reserved.{footer_credits ? ` ${footer_credits}.` : ""}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 items-center text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <button
              data-action="open-cookie-settings"
              className="hover:text-white transition-colors text-left underline underline-offset-2 decoration-gray-600 hover:decoration-white"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
