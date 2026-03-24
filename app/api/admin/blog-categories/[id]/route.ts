import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user;
}

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.blogCategory.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  let body: { name?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, slug } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { error: "name and slug are required." },
      { status: 400 }
    );
  }

  // Check uniqueness excluding self
  if (name !== existing.name) {
    const dupe = await prisma.blogCategory.findUnique({ where: { name } });
    if (dupe) {
      return NextResponse.json(
        { error: "A category with this name already exists." },
        { status: 409 }
      );
    }
  }

  if (slug !== existing.slug) {
    const dupe = await prisma.blogCategory.findUnique({ where: { slug } });
    if (dupe) {
      return NextResponse.json(
        { error: "A category with this slug already exists." },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.blogCategory.update({
    where: { id },
    data: { name, slug },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.blogCategory.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (existing._count.posts > 0) {
    // Unlink posts before deleting
    await prisma.blogPost.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
  }

  await prisma.blogCategory.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
