import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AdminCategoriesManager from "@/components/dashboard/AdminCategoriesManager";

export default async function AdminBlogCategoriesPage() {
  await requireRole("ADMIN");

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });

  const serialized = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    postCount: c._count.posts,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Blog Categories</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage categories for blog posts.
        </p>
      </div>
      <AdminCategoriesManager initialCategories={serialized} />
    </div>
  );
}
