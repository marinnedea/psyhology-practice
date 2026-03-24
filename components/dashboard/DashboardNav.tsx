"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };
export type NavGroup = { group: string; items: NavItem[] };
export type NavEntry =
  | { type: "item" } & NavItem
  | { type: "group" } & NavGroup;

export default function DashboardNav({ entries }: { entries: NavEntry[] }) {
  const pathname = usePathname();

  function isActive(href: string) {
    // Exact match for root dashboard pages
    if (href === "/admin" || href === "/psychologist" || href === "/client") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="space-y-0.5">
      {entries.map((entry, i) => {
        if (entry.type === "item") {
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(entry.href)
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {entry.label}
            </Link>
          );
        }

        // Group
        return (
          <div key={`group-${i}`} className="pt-4 first:pt-0">
            <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest select-none">
              {entry.group}
            </p>
            <div className="space-y-0.5">
              {entry.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center pl-5 pr-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
