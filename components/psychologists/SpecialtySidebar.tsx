"use client";

import { useState } from "react";
import Link from "next/link";

// Groupings based on established branches of applied psychology practice
const SPECIALTY_GROUPS: { label: string; specialties: string[] }[] = [
  {
    label: "Anxiety & Related",
    specialties: [
      "Anxiety",
      "OCD",
      "Phobias",
      "Health Anxiety",
      "Performance Anxiety",
    ],
  },
  {
    label: "Mood & Wellbeing",
    specialties: [
      "Depression",
      "Burnout",
      "Grief & Loss",
      "Stress Management",
      "Life Transitions",
    ],
  },
  {
    label: "Trauma & Recovery",
    specialties: ["Trauma & PTSD", "EMDR", "Addiction", "Substance Misuse", "Dual Diagnosis"],
  },
  {
    label: "Relationships & Family",
    specialties: [
      "Couples Therapy",
      "Family Therapy",
      "Parenting",
      "Relationships",
      "Attachment",
      "EFT",
      "Divorce & Separation",
      "Perinatal Mental Health",
    ],
  },
  {
    label: "Children & Young People",
    specialties: ["Child & Adolescent", "ADHD", "Child Development"],
  },
  {
    label: "Therapeutic Approaches",
    specialties: [
      "CBT",
      "ACT",
      "Mindfulness",
      "Existential Therapy",
      "Motivation",
    ],
  },
  {
    label: "Specialist Areas",
    specialties: [
      "Men's Mental Health",
      "Sport Psychology",
      "Ageing & Gerontology",
      "Cognitive Decline",
      "Carers",
      "Cross-Cultural Psychology",
      "Identity & Belonging",
      "Migration",
    ],
  },
];

interface Props {
  allSpecialties: string[];
  countBySpecialty: Record<string, number>;
  totalCount: number;
  currentSpecialty?: string;
}

export default function SpecialtySidebar({
  allSpecialties,
  countBySpecialty,
  totalCount,
  currentSpecialty,
}: Props) {
  const availableSet = new Set(allSpecialties);

  // Build groups containing only specialties that actually exist in the DB
  const groups = SPECIALTY_GROUPS.map((g) => ({
    ...g,
    items: g.specialties.filter((s) => availableSet.has(s)),
  })).filter((g) => g.items.length > 0);

  // Catch-all for any specialty not covered by the groups above
  const groupedSet = new Set(SPECIALTY_GROUPS.flatMap((g) => g.specialties));
  const ungrouped = allSpecialties.filter((s) => !groupedSet.has(s));
  if (ungrouped.length > 0) {
    groups.push({ label: "Other", specialties: ungrouped, items: ungrouped });
  }

  // Which group contains the active specialty — always kept expanded
  const activeGroup = groups.find((g) =>
    g.items.some((s) => s === currentSpecialty)
  )?.label;

  const [search, setSearch] = useState("");
  // Default: all collapsed (true). Active group is always open regardless.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const q = search.trim().toLowerCase();

  // When searching, filter items and force those groups open
  const visibleGroups = groups
    .map((g) => ({
      ...g,
      items: q
        ? g.items.filter((s) => s.toLowerCase().includes(q))
        : g.items,
    }))
    .filter((g) => g.items.length > 0);

  const isOpen = (label: string) => {
    if (label === activeGroup) return true;   // active group always open
    if (q) return true;                       // search forces all open
    return !(collapsed[label] ?? true);       // default collapsed
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      {/* Search */}
      <div className="relative mb-4">
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
          placeholder="Search specialties…"
          className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Specialty
      </h3>

      {/* All psychologists */}
      <Link
        href="/psychologists"
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-3 ${
          !currentSpecialty
            ? "bg-indigo-50 text-indigo-700"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        {!currentSpecialty && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
        )}
        <span className={!currentSpecialty ? "" : "ml-4"}>All</span>
        <span className="ml-auto text-xs text-gray-400">{totalCount}</span>
      </Link>

      {/* Grouped specialties */}
      {visibleGroups.length === 0 && q && (
        <p className="text-xs text-gray-400 px-2 py-3 text-center">No specialties match.</p>
      )}

      <div className="space-y-0.5">
        {visibleGroups.map((group) => {
          const open = isOpen(group.label);
          const groupActive = group.items.some((s) => s === currentSpecialty);

          return (
            <div key={group.label}>
              {/* Group header / toggle */}
              <button
                onClick={() => toggle(group.label)}
                aria-expanded={open}
                aria-label={`${open ? "Collapse" : "Expand"} ${group.label}`}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${
                  groupActive
                    ? "text-indigo-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg
                  aria-hidden="true"
                  className={`w-3 h-3 shrink-0 transition-transform duration-150 ${
                    open ? "" : "-rotate-90"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span className="truncate" aria-hidden="true">{group.label}</span>
              </button>

              {/* Specialty items */}
              {open && (
                <ul className="mt-0.5 mb-1 ml-1 space-y-0.5">
                  {group.items.map((s) => {
                    const count = countBySpecialty[s] ?? 0;
                    const active = currentSpecialty === s;
                    return (
                      <li key={s}>
                        <Link
                          href={`/psychologists?specialty=${encodeURIComponent(s)}`}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            active
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          )}
                          <span className={active ? "" : "ml-4 truncate"}>{s}</span>
                          <span className="ml-auto text-xs text-gray-400 shrink-0">
                            {count}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
