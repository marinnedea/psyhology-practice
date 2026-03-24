import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { name: true } } },
  });
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | MindBridge Blog`,
    description: post.excerpt ?? post.title,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: {
        select: {
          name: true,
          psychologistProfile: { select: { specialties: true, profileImage: true } },
        },
      },
      category: true,
      featuredImage: true,
    },
  });

  if (!post) notFound();

  // Related posts (same category, excluding current)
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: post.id },
      ...(post.categoryId ? { categoryId: post.categoryId } : {}),
    },
    include: { author: { select: { name: true } }, category: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          {post.category && (
            <>
              <span>/</span>
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {post.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700 truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Featured image */}
        {post.featuredImage && (
          <div className="rounded-xl overflow-hidden mb-8 h-72 md:h-96">
            <img
              src={post.featuredImage.localPath}
              alt={post.featuredImage.altText ?? post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article */}
        <article className="bg-white rounded-xl border border-gray-200 p-8 md:p-12">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {post.category && (
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide hover:bg-blue-100 transition-colors"
              >
                {post.category.name}
              </Link>
            )}
            {post.publishedAt && (
              <span className="text-sm text-gray-500">
                {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-4 mb-10 pb-8 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{post.author.name}</p>
              {post.author.psychologistProfile?.specialties &&
                post.author.psychologistProfile.specialties.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {post.author.psychologistProfile.specialties.slice(0, 2).join(" · ")}
                  </p>
                )}
            </div>
          </div>

          {/* Content — rendered from TinyMCE HTML */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/blog/${rp.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
                >
                  {rp.category && (
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      {rp.category.name}
                    </span>
                  )}
                  <h3 className="font-bold text-gray-900 mt-1 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {rp.title}
                  </h3>
                  <p className="text-xs text-gray-500">{rp.author.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="text-blue-600 hover:underline font-medium"
          >
            ← Back to all articles
          </Link>
        </div>
      </div>
    </div>
  );
}
