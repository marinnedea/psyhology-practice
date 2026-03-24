import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

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

export default async function BlogListPage() {
  const user = await requireRole("PSYCHOLOGIST");

  const posts = await prisma.blogPost.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your articles and posts.
          </p>
        </div>
        <Link
          href="/psychologist/blog/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">
            You haven&apos;t written any posts yet.
          </p>
          <Link
            href="/psychologist/blog/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Title
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Category
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">
                        {post.title}
                      </div>
                      <div className="text-gray-400 text-xs">{post.slug}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {post.category?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/psychologist/blog/${post.id}`}
                          className="text-blue-600 hover:underline text-xs font-medium"
                        >
                          Edit
                        </Link>
                        {post.status === "PUBLISHED" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:underline text-xs font-medium"
                          >
                            View ↗
                          </Link>
                        )}
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
