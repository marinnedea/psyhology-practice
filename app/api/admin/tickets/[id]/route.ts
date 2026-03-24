import { NextRequest, NextResponse } from "next/server";
import { requireRole, getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail, ticketStatusChangedEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

const UpdateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["NORMAL", "HIGH", "URGENT"]).optional(),
});

// GET /api/admin/tickets/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("ADMIN");
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, role: true, image: true } },
        },
      },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ticket);
}

// PATCH /api/admin/tickets/[id] — update status/priority
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("ADMIN");
  const { id } = await params;

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const prev = await prisma.ticket.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true, role: true } } },
  });
  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ticket = await prisma.ticket.update({
    where: { id },
    data: parsed.data,
  });

  // Notify on status change
  if (parsed.data.status && parsed.data.status !== prev.status) {
    try {
      const settings = await getSettings();
      if (settings.ticketing_enabled === "1" && settings.smtp_enabled === "1") {
        const siteUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
        const ownerRole = prev.user.role as "CLIENT" | "PSYCHOLOGIST";
        const template = ticketStatusChangedEmail({
          ticketId: ticket.id,
          subject: ticket.subject,
          userName: prev.user.name,
          newStatus: parsed.data.status,
          siteUrl,
          role: ownerRole,
        });
        await sendEmail({ to: prev.user.email, ...template });
      }
    } catch {
      // silent
    }
  }

  return NextResponse.json(ticket);
}
