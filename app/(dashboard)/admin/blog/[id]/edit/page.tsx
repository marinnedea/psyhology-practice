import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import BlogEditor from "@/components/dashboard/BlogEditor";

type Params = Promise<{ id: string }>;

export default async function AdminEditPostPage({ params }: { params: Params }) {
  await requireRole("ADMIN");
  const { id } = await params;

  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        featuredImage: true,
      },
    }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-500 text-sm mt-1">Update this blog article.</p>
      </div>
      <BlogEditor categories={categories} post={post} userRole="ADMIN" />
    </div>
  );
}
