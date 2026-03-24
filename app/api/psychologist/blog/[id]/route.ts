import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getPsychSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PSYCHOLOGIST") return null;
  return session.user;
}

type Params = { params: Promise<{ id: string }> };

const ALLOWED_STATUSES = ["DRAFT", "PENDING"];

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getPsychSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!post || post.authorId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getPsychSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing || existing.authorId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string | null;
    categoryId?: string | null;
    status?: string;
    featuredImageId?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, slug, content, excerpt, categoryId, status, featuredImageId } = body;

  // Psychologists cannot set PUBLISHED or REJECTED
  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Psychologists can only set status to DRAFT or PENDING." },
      { status: 403 }
    );
  }

  // Check slug uniqueness (excluding current post)
  if (slug && slug !== existing.slug) {
    const slugConflict = await prisma.blogPost.findUnique({ where: { slug } });
    if (slugConflict) {
      return NextResponse.json(
        { error: "A post with this slug already exists." },
        { status: 409 }
      );
    }
  }

  const newStatus = (status ?? existing.status) as "DRAFT" | "PENDING";

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      slug: slug ?? existing.slug,
      content: content ?? existing.content,
      excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
      categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
      status: newStatus,
      // publishedAt only set by admin when status becomes PUBLISHED
      publishedAt: existing.publishedAt,
      featuredImageId: featuredImageId !== undefined ? featuredImageId : existing.featuredImageId,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getPsychSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing || existing.authorId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
