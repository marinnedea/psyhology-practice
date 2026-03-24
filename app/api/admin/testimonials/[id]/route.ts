import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "ADMIN" ? session : null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: {
    clientName?: string;
    clientRole?: string;
    quote?: string;
    rating?: number;
    avatarUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { clientName, clientRole, quote, rating, avatarUrl, isActive, sortOrder } = body;

  if (!clientName?.trim() || !quote?.trim()) {
    return NextResponse.json({ error: "clientName and quote are required" }, { status: 400 });
  }

  try {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        clientName: clientName.trim(),
        clientRole: clientRole?.trim() || null,
        quote: quote.trim(),
        rating: typeof rating === "number" ? Math.min(5, Math.max(1, rating)) : 5,
        avatarUrl: avatarUrl?.trim() || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    return NextResponse.json(testimonial);
  } catch {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }
}
