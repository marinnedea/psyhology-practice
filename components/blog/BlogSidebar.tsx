"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  countByCategory: Record<string, number>;
  totalCount: number;
  currentCategory?: string;
  currentSearch?: string;
}

export default function BlogSidebar({
  categories,
  countByCategory,
  totalCount,
  currentCategory,
  currentSearch,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch ?? "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (currentCategory) params.set("category", currentCategory);
    router.push(`/blog${params.size ? `?${params}` : ""}`);
  };

  const clearSearch = () => {
    setSearch("");
    const params = new URLSearchParams();
    if (currentCategory) params.set("category", currentCategory);
    router.push(`/blog${params.size ? `?${params}` : ""}`);
  };

  // Visible categories = those that have at least 1 published post
  const visibleCats = categories.filter(
    (c) => (countByCategory[c.id] ?? 0) > 0
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
      {/* Search */}
      <form onSubmit={handleSearch}>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">
          Search
        </label>
        <div className="relative">
          <svg
            className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {/* Active search badge */}
        {currentSearch && (
          <p className="mt-2 text-xs text-indigo-600 font-medium">
            Results for &ldquo;{currentSearch}&rdquo;
          </p>
        )}
      </form>

      {/* Categories */}
      {visibleCats.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Categories
          </h3>
          <ul className="space-y-0.5">
            <li>
              <Link
                href={currentSearch ? `/blog?search=${encodeURIComponent(currentSearch)}` : "/blog"}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !currentCategory
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {!currentCategory && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                )}
                <span className={!currentCategory ? "" : "ml-4"}>All Posts</span>
                <span className="ml-auto text-xs text-gray-400">{totalCount}</span>
              </Link>
            </li>
            {visibleCats.map((cat) => {
              const count = countByCategory[cat.id] ?? 0;
              const active = currentCategory === cat.slug;
              const href = currentSearch
                ? `/blog?category=${cat.slug}&search=${encodeURIComponent(currentSearch)}`
                : `/blog?category=${cat.slug}`;
              return (
                <li key={cat.id}>
                  <Link
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    )}
                    <span className={active ? "" : "ml-4"}>{cat.name}</span>
                    <span className="ml-auto text-xs text-gray-400">{count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
