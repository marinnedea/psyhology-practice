import { prisma } from "@/lib/db";
import Link from "next/link";
import BlogSidebar from "@/components/blog/BlogSidebar";

export const metadata = {
  title: "Blog | MindBridge",
  description: "Expert articles on mental health, therapy, and well-being from our team of psychologists.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;

  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category: { slug: category } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { excerpt: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      author: { select: { name: true } },
      category: true,
      featuredImage: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });

  // Count posts per category (unfiltered, for sidebar display)
  const allPosts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { categoryId: true },
  });
  const countByCategory = allPosts.reduce<Record<string, number>>((acc, p) => {
    if (p.categoryId) acc[p.categoryId] = (acc[p.categoryId] ?? 0) + 1;
    return acc;
  }, {});

  // The very latest published post (used for the featured banner, always unfiltered)
  const latestPost = await prisma.blogPost.findFirst({
    where: { status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      category: true,
      featuredImage: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  // Active filter summary for the content header
  const activeCategory = categories.find((c) => c.slug === category);
  const hasFilters = !!(category || search);

  // Build clear-filters href
  const clearHref = "/blog";

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50 py-16 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">
            Insights &amp; Perspectives
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Expert articles on mental health, therapy, and psychological well-being
            from our team of qualified psychologists.
          </p>
        </div>
      </section>

      {/* ── Latest Post Featured Banner ── */}
      {latestPost && !hasFilters && (
        <section className="bg-white border-b border-gray-100 px-4 py-10">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-5">
              Latest Article
            </p>
            <Link
              href={`/blog/${latestPost.slug}`}
              className="group flex flex-col md:flex-row gap-0 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow bg-white"
            >
              {/* Image */}
              <div className="md:w-1/2 h-64 md:h-auto overflow-hidden bg-gradient-to-br from-indigo-100 to-blue-100 shrink-0">
                {latestPost.featuredImage ? (
                  <img
                    src={latestPost.featuredImage.localPath}
                    alt={latestPost.featuredImage.altText ?? latestPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-8 md:p-12 md:w-1/2">
                {latestPost.category && (
                  <span className="inline-block text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">
                    {latestPost.category.name}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-4 group-hover:text-indigo-700 transition-colors">
                  {latestPost.title}
                </h2>
                {latestPost.excerpt && (
                  <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">
                    {latestPost.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                      {latestPost.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{latestPost.author.name}</p>
                      {latestPost.publishedAt && (
                        <p className="text-xs text-gray-400">
                          {new Date(latestPost.publishedAt).toLocaleDateString("en-GB", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:gap-3 transition-all">
                    Read article
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Mobile filter strip (category only; search is in sidebar on desktop) */}
      {categories.length > 0 && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 items-center whitespace-nowrap">
            <Link
              href="/blog"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                !category ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                  category === cat.slug ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main layout: sidebar + content */}
      <div className="py-12 px-4 bg-gray-50 min-h-[60vh]">
        <div className="max-w-5xl mx-auto flex gap-8 items-start">

          {/* Sidebar — desktop only */}
          <aside className="hidden md:block w-56 shrink-0 sticky top-24 self-start">
            <BlogSidebar
              categories={categories}
              countByCategory={countByCategory}
              totalCount={allPosts.length}
              currentCategory={category}
              currentSearch={search}
            />
          </aside>

          {/* Posts */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-gray-600">
                  <strong>{posts.length}</strong> post{posts.length !== 1 ? "s" : ""}
                  {search || category ? " for" : ""}
                </span>
                {search && (
                  <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                    &ldquo;{search}&rdquo;
                    <Link
                      href={category ? `/blog?category=${category}` : "/blog"}
                      className="ml-1 hover:text-indigo-600"
                      aria-label="Clear search"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Link>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                    {activeCategory?.name ?? category}
                    <Link
                      href={search ? `/blog?search=${encodeURIComponent(search)}` : "/blog"}
                      className="ml-1 hover:text-indigo-600"
                      aria-label="Clear category"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Link>
                  </span>
                )}
                {(search && category) && (
                  <Link href={clearHref} className="text-xs text-gray-400 hover:text-gray-600 underline">
                    Clear all
                  </Link>
                )}
              </div>
            )}

            {posts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col group"
                  >
                    <div className="h-48 overflow-hidden bg-gradient-to-br from-indigo-100 to-blue-100">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage.localPath}
                          alt={post.featuredImage.altText ?? post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      {post.category && (
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                          {post.category.name}
                        </span>
                      )}
                      <h2 className="text-base font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs font-medium text-gray-500">
                          {post.author.name}
                        </span>
                        {post.publishedAt && (
                          <span className="text-xs text-gray-400">
                            {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {search
                    ? `No posts matching "${search}"`
                    : category
                    ? "No posts in this category yet"
                    : "No blog posts yet"}
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  {search
                    ? "Try different keywords or browse all posts."
                    : category
                    ? "Check back soon or browse all posts."
                    : "Our psychologists are working on some great articles."}
                </p>
                {hasFilters && (
                  <Link
                    href="/blog"
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    View All Posts
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
