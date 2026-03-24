import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail, ticketCreatedEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

const CreateSchema = z.object({
  subject: z.string().min(3).max(200),
  category: z.enum(["TECHNICAL", "APPOINTMENT", "BILLING", "GENERAL", "OTHER"]).default("GENERAL"),
  body: z.string().min(10),
});

// GET /api/tickets — list own tickets
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tickets = await prisma.ticket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(tickets);
}

// POST /api/tickets — create ticket + first message
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { subject, category, body: messageBody } = parsed.data;

  const ticket = await prisma.ticket.create({
    data: {
      userId: user.id,
      subject,
      category,
      messages: {
        create: {
          senderId: user.id,
          body: messageBody,
          isInternal: false,
        },
      },
    },
    include: { messages: true },
  });

  // Send confirmation email if SMTP + ticketing enabled
  try {
    const settings = await getSettings();
    if (settings.ticketing_enabled === "1" && settings.smtp_enabled === "1") {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const template = ticketCreatedEmail({
        ticketId: ticket.id,
        subject: ticket.subject,
        userName: user.name ?? "User",
        siteUrl,
      });
      if (user.email) await sendEmail({ to: user.email, ...template });
    }
  } catch {
    // Email failure should not break ticket creation
  }

  return NextResponse.json(ticket, { status: 201 });
}
