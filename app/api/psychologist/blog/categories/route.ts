import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requirePsychOrAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== "PSYCHOLOGIST" && session.user.role !== "ADMIN")
    return null;
  return session.user;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  const user = await requirePsychOrAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const user = await requirePsychOrAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = toSlug(name);
  if (!slug) {
    return NextResponse.json({ error: "Invalid category name" }, { status: 400 });
  }

  try {
    const category = await prisma.blogCategory.create({
      data: { name, slug },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "A category with this name already exists." },
        { status: 409 }
      );
    }
    throw err;
  }
}
