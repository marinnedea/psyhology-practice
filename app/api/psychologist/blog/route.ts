import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getPsychSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PSYCHOLOGIST") return null;
  return session.user;
}

const ALLOWED_STATUSES = ["DRAFT", "PENDING"];

export async function GET() {
  const user = await getPsychSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.blogPost.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const user = await getPsychSession();
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
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, slug, content, excerpt, categoryId, status, featuredImageId } = body;

  if (!title || !slug || !content) {
    return NextResponse.json(
      { error: "title, slug, and content are required" },
      { status: 400 }
    );
  }

  // Psychologists can only set DRAFT or PENDING
  const resolvedStatus = status ?? "DRAFT";
  if (!ALLOWED_STATUSES.includes(resolvedStatus)) {
    return NextResponse.json(
      { error: "Psychologists can only set status to DRAFT or PENDING." },
      { status: 403 }
    );
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
      status: resolvedStatus as "DRAFT" | "PENDING",
      publishedAt: null,
      featuredImageId: featuredImageId ?? null,
      authorId: user.id,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
