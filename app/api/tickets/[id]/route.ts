import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

// GET /api/tickets/[id] — get ticket thread (own tickets only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, role: true, image: true } },
        },
      },
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only owner or ADMIN can view
  if (ticket.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(ticket);
}
