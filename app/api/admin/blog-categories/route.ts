import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user;
}

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const existingName = await prisma.blogCategory.findUnique({ where: { name } });
  if (existingName) {
    return NextResponse.json(
      { error: "A category with this name already exists." },
      { status: 409 }
    );
  }

  const existingSlug = await prisma.blogCategory.findUnique({ where: { slug } });
  if (existingSlug) {
    return NextResponse.json(
      { error: "A category with this slug already exists." },
      { status: 409 }
    );
  }

  const category = await prisma.blogCategory.create({
    data: { name, slug },
  });

  return NextResponse.json(category, { status: 201 });
}
