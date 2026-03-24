import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import BlogEditor from "@/components/dashboard/BlogEditor";

export default async function NewPostPage() {
  await requireRole("PSYCHOLOGIST");

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Blog Post</h1>
        <p className="text-gray-500 text-sm mt-1">Write and publish a new article.</p>
      </div>
      <BlogEditor categories={categories} post={null} userRole="PSYCHOLOGIST" />
    </div>
  );
}
