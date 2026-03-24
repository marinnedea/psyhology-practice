import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user;
}

export async function GET(req: NextRequest) {
  const user = await getAdminSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const statusFilter =
    statusParam && statusParam !== "all" ? statusParam.toUpperCase() : undefined;

  const posts = await prisma.blogPost.findMany({
    where: statusFilter
      ? { status: statusFilter as "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const user = await getAdminSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string | null;
    categoryId?: string | null;
    status?: string;
    featuredImageId?: string | null;
    authorId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, slug, content, excerpt, categoryId, status, featuredImageId, authorId } = body;

  if (!title || !slug || !content) {
    return NextResponse.json(
      { error: "title, slug, and content are required" },
      { status: 400 }
    );
  }

  const resolvedStatus = status ?? "DRAFT";
  const validStatuses = ["DRAFT", "PENDING", "PUBLISHED", "REJECTED"];
  if (!validStatuses.includes(resolvedStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A post with this slug already exists." },
      { status: 409 }
    );
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt ?? null,
      categoryId: categoryId ?? null,
      status: resolvedStatus as "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED",
      publishedAt: resolvedStatus === "PUBLISHED" ? new Date() : null,
      featuredImageId: featuredImageId ?? null,
      authorId: authorId ?? user.id,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
