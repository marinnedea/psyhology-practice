import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail, ticketReplyEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

const ReplySchema = z.object({
  body: z.string().min(1),
});

// POST /api/tickets/[id]/messages — reply to a ticket
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only ticket owner or admin can reply
  if (ticket.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (ticket.status === "CLOSED") {
    return NextResponse.json({ error: "Ticket is closed" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = ReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      senderId: user.id,
      body: parsed.data.body,
      isInternal: false,
    },
    include: {
      sender: { select: { id: true, name: true, role: true, image: true } },
    },
  });

  // Bump updatedAt + possibly set IN_PROGRESS
  await prisma.ticket.update({
    where: { id },
    data: {
      updatedAt: new Date(),
      status: ticket.status === "OPEN" && user.role === "ADMIN" ? "IN_PROGRESS" : undefined,
    },
  });

  // Notify ticket owner if admin replied
  if (user.role === "ADMIN" && ticket.userId !== user.id) {
    try {
      const settings = await getSettings();
      if (settings.ticketing_enabled === "1" && settings.smtp_enabled === "1") {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const ownerRole = ticket.user.role as "CLIENT" | "PSYCHOLOGIST";
        const template = ticketReplyEmail({
          ticketId: ticket.id,
          subject: ticket.subject,
          userName: ticket.user.name,
          replierName: user.name ?? "Support",
          messagePreview: parsed.data.body.slice(0, 300),
          siteUrl,
          role: ownerRole,
        });
        await sendEmail({ to: ticket.user.email, ...template });
      }
    } catch {
      // silent
    }
  }

  return NextResponse.json(message, { status: 201 });
}
