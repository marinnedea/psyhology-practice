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

  const existing = await prisma.pageSection.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  let body: {
    title?: string | null;
    subtitle?: string | null;
    content?: string | null;
    isVisible?: boolean;
    sortOrder?: number;
    metadata?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updated = await prisma.pageSection.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.isVisible !== undefined && { isVisible: body.isVisible }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      ...(body.metadata !== undefined && { metadata: body.metadata ?? undefined }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.pageSection.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  await prisma.pageSection.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
