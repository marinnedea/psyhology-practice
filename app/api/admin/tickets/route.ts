import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

// GET /api/admin/tickets — list all tickets with filters
export async function GET(req: NextRequest) {
  await requireRole("ADMIN");

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const priority = searchParams.get("priority");

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(category ? { category: category as never } : {}),
      ...(priority ? { priority: priority as never } : {}),
    },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(tickets);
}
