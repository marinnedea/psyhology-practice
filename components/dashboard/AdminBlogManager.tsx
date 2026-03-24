"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string };
  category: { name: string } | null;
};

type Props = {
  posts: Post[];
  currentStatus: string;
};

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending Review" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Draft" },
  { key: "rejected", label: "Rejected" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
    DRAFT: "bg-gray-100 text-gray-600",
  };
  const labels: Record<string, string> = {
    PUBLISHED: "Published",
    PENDING: "Pending Review",
    REJECTED: "Rejected",
    DRAFT: "Draft",
  };
  const cls = styles[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {labels[status] ?? status}
    </span>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function AdminBlogManager({ posts, currentStatus }: Props) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setActionLoading(id + "-approve");
    setError(null);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to approve post.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id + "-reject");
    setError(null);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to reject post.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionLoading(id + "-delete");
    setError(null);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete post.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/blog?status=${tab.key}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentStatus === tab.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
        <Link
          href="/admin/blog/new"
          className="ml-auto bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Post
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm">No posts found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Title</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Author</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900 max-w-xs truncate">
                        {post.title}
                      </div>
                      <div className="text-gray-400 text-xs">{post.slug}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{post.author.name}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {post.category?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="text-blue-600 hover:underline text-xs font-medium"
                        >
                          Edit
                        </Link>
                        {post.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(post.id)}
                              disabled={actionLoading !== null}
                              className="text-green-600 hover:underline text-xs font-medium disabled:opacity-50"
                            >
                              {actionLoading === post.id + "-approve" ? "..." : "Approve"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(post.id)}
                              disabled={actionLoading !== null}
                              className="text-orange-600 hover:underline text-xs font-medium disabled:opacity-50"
                            >
                              {actionLoading === post.id + "-reject" ? "..." : "Reject"}
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={actionLoading !== null}
                          className="text-red-600 hover:underline text-xs font-medium disabled:opacity-50"
                        >
                          {actionLoading === post.id + "-delete" ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
