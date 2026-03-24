import { NextRequest, NextResponse } from "next/server";
import { requireRole, getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail, ticketReplyEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

const ReplySchema = z.object({
  body: z.string().min(1),
  isInternal: z.boolean().default(false),
});

// POST /api/admin/tickets/[id]/messages — admin reply (supports internal notes)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("ADMIN");
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
      isInternal: parsed.data.isInternal,
    },
    include: {
      sender: { select: { id: true, name: true, role: true, image: true } },
    },
  });

  // Update ticket status to IN_PROGRESS if it was OPEN
  await prisma.ticket.update({
    where: { id },
    data: {
      updatedAt: new Date(),
      status: ticket.status === "OPEN" ? "IN_PROGRESS" : undefined,
    },
  });

  // Send email notification to ticket owner (skip internal notes)
  if (!parsed.data.isInternal) {
    try {
      const settings = await getSettings();
      if (settings.ticketing_enabled === "1" && settings.smtp_enabled === "1") {
        const siteUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
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
