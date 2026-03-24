import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AdminBlogManager from "@/components/dashboard/AdminBlogManager";

type SearchParams = Promise<{ status?: string }>;

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole("ADMIN");
  const { status } = await searchParams;

  const statusFilter = status && status !== "all" ? status.toUpperCase() : undefined;

  const posts = await prisma.blogPost.findMany({
    where: statusFilter
      ? { status: statusFilter as "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage all blog posts and review submissions.
        </p>
      </div>
      <AdminBlogManager posts={posts} currentStatus={status ?? "all"} />
    </div>
  );
}
