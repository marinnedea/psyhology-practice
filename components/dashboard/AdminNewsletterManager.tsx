"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Subscriber = {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
};

type Props = {
  initialSubscribers: Subscriber[];
  page: number;
  pageSize: number;
  total: number;
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default function AdminNewsletterManager({ initialSubscribers, page, pageSize, total }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleToggle(subscriber: Subscriber) {
    const newState = !subscriber.isActive;
    setLoading(subscriber.id);
    try {
      const res = await fetch(`/api/admin/newsletter/${subscriber.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newState }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to update subscriber.");
        return;
      }
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === subscriber.id
            ? {
                ...s,
                isActive: data.isActive,
                unsubscribedAt: data.unsubscribedAt ?? null,
              }
            : s
        )
      );
      showToast(newState ? "Subscriber re-activated." : "Subscriber deactivated.");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  function exportCSV() {
    const rows = [
      ["Email", "Status", "Subscribed At", "Unsubscribed At"],
      ...subscribers.map((s) => [
        s.email,
        s.isActive ? "Active" : "Inactive",
        formatDate(s.subscribedAt),
        s.unsubscribedAt ? formatDate(s.unsubscribedAt) : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const displayed = subscribers.filter((s) => {
    if (filter === "active") return s.isActive;
    if (filter === "inactive") return !s.isActive;
    return true;
  });

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                filter === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={exportCSV}
          className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {displayed.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            No subscribers match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Subscribed
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Unsubscribed
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 text-gray-900">{sub.email}</td>
                    <td className="px-5 py-3">
                      {sub.isActive ? (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {formatDate(sub.subscribedAt)}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {sub.unsubscribedAt ? formatDate(sub.unsubscribedAt) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggle(sub)}
                        disabled={loading === sub.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors ${
                          sub.isActive
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {loading === sub.id
                          ? "Updating…"
                          : sub.isActive
                          ? "Unsubscribe"
                          : "Re-subscribe"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
          <span>
            Page {page + 1} of {totalPages} ({total} total)
          </span>
          <div className="flex items-center gap-1">
            {page > 0 && (
              <Link href={`/admin/newsletter?page=${page - 1}`} className="px-3 py-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium">← Prev</Link>
            )}
            {page + 1 < totalPages && (
              <Link href={`/admin/newsletter?page=${page + 1}`} className="px-3 py-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium">Next →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
