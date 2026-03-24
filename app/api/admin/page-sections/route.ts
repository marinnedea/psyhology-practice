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

  const sections = await prisma.pageSection.findMany({
    orderBy: [{ page: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    page?: string;
    sectionKey?: string;
    title?: string | null;
    subtitle?: string | null;
    content?: string | null;
    sortOrder?: number;
    isVisible?: boolean;
    metadata?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { page, sectionKey, title, subtitle, content, sortOrder, isVisible, metadata } = body;

  if (!page || !sectionKey) {
    return NextResponse.json(
      { error: "page and sectionKey are required." },
      { status: 400 }
    );
  }

  const existing = await prisma.pageSection.findUnique({
    where: { page_sectionKey: { page, sectionKey } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A section with this page/sectionKey combination already exists." },
      { status: 409 }
    );
  }

  const section = await prisma.pageSection.create({
    data: {
      page,
      sectionKey,
      title: title ?? null,
      subtitle: subtitle ?? null,
      content: content ?? null,
      sortOrder: sortOrder ?? 0,
      isVisible: isVisible ?? true,
      metadata: metadata ?? undefined,
    },
  });

  return NextResponse.json(section, { status: 201 });
}
