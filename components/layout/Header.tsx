"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef } from "react";
import { SessionProvider } from "next-auth/react";
import { useSiteSettings } from "@/app/providers";
import { ThemeToggle } from "./ThemeToggle";

type NavLink = { href: string; label: string; exact?: boolean };

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", exact: true },
  { href: "/psychologists", label: "Find a Psychologist" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const SERVICES_LINKS = [
  { href: "/services", label: "For Individuals" },
  { href: "/services/organisations", label: "For Organisations" },
];

function ServicesDropdown({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const isActive = pathname === "/services" || pathname.startsWith("/services/");
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }
  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  }

  // Mobile inline version
  if (onNavigate !== undefined) {
    return (
      <>
        <span className={`block py-2 ${isActive ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-gray-600 dark:text-gray-300"}`}>
          Services
        </span>
        {SERVICES_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block py-1.5 pl-4 text-sm ${pathname === href ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"} transition-colors`}
            onClick={onNavigate}
          >
            {label}
          </Link>
        ))}
      </>
    );
  }

  // Desktop dropdown
  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-1 ${isActive ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Services
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50">
          {SERVICES_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-4 py-2 text-sm ${pathname === href ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-slate-700" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"} transition-colors`}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function HeaderContent() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const { site_name, logo_url, logo_2x_url } = useSiteSettings() as { site_name: string; logo_url: string; logo_2x_url: string };
  const pathname = usePathname();

  const dashboardPath = session?.user?.role
    ? session.user.role === "ADMIN"
      ? "/admin"
      : session.user.role === "PSYCHOLOGIST"
        ? "/psychologist"
        : "/client"
    : "/login";

  function isActive(href: string, exact?: boolean): boolean {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function navClass(href: string, exact?: boolean): string {
    const active = isActive(href, exact);
    return active
      ? "text-blue-600 dark:text-blue-400 font-semibold"
      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors";
  }

  function mobileNavClass(href: string, exact?: boolean): string {
    const active = isActive(href, exact);
    return active
      ? "block py-2 text-blue-600 dark:text-blue-400 font-semibold"
      : "block py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors";
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
      <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            {logo_url ? (
              <img
                src={logo_url}
                srcSet={logo_2x_url ? `${logo_url} 1x, ${logo_2x_url} 2x` : undefined}
                alt={site_name}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <circle cx="8" cy="22" r="5" fill="#2563eb" />
                  <circle cx="24" cy="22" r="5" fill="#2563eb" />
                  <path d="M3 22 Q16 4 29 22" stroke="#2563eb" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">{site_name}</span>
              </>
            )}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link href="/" className={navClass("/", true)}>Home</Link>
            <ServicesDropdown pathname={pathname} />
            {NAV_LINKS.filter(l => l.href !== "/").map(({ href, label, exact }) => (
              <Link key={href} href={href} className={navClass(href, exact)}>
                {label}
              </Link>
            ))}

            <ThemeToggle />

            {session?.user ? (
              <div className="flex items-center gap-4">
                <Link
                  href={dashboardPath}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div id="mobile-menu" className="md:hidden pb-4 space-y-1 border-t border-gray-100 dark:border-slate-700 pt-3">
            <Link href="/" className={mobileNavClass("/", true)} onClick={() => setMenuOpen(false)}>Home</Link>
            <ServicesDropdown pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            {NAV_LINKS.filter(l => l.href !== "/").map(({ href, label, exact }) => (
              <Link
                key={href}
                href={href}
                className={mobileNavClass(href, exact)}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {session?.user ? (
              <>
                <Link
                  href={dashboardPath}
                  className="block py-2 text-blue-600 dark:text-blue-400 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block py-2 text-gray-500 dark:text-gray-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2 text-gray-600 dark:text-gray-300"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block py-2 text-blue-600 dark:text-blue-400 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export function Header() {
  return (
    <SessionProvider>
      <HeaderContent />
    </SessionProvider>
  );
}
