import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AdminBlogManager from "@/components/dashboard/AdminBlogManager";

const PAGE_SIZE = 20;

type SearchParams = Promise<{ status?: string; page?: string }>;

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole("ADMIN");
  const { status, page: pageParam } = await searchParams;

  const statusFilter = status && status !== "all" ? status.toUpperCase() : undefined;
  const page = Math.max(0, parseInt(pageParam ?? "0", 10) || 0);

  const where = statusFilter
    ? { status: statusFilter as "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" }
    : undefined;

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage all blog posts and review submissions.
        </p>
      </div>
      <AdminBlogManager
        posts={posts}
        currentStatus={status ?? "all"}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
}
