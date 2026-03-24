import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail, contactReplyEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

const ReplySchema = z.object({
  body: z.string().min(1, "Reply cannot be empty"),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = ReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Check SMTP is enabled before attempting send
  const settings = await getSettings();
  if (settings.smtp_enabled !== "1") {
    return NextResponse.json({ error: "SMTP is not enabled" }, { status: 400 });
  }

  const fromName = settings.smtp_from_name || settings.site_name || "Support Team";

  const template = contactReplyEmail({
    toName: message.name,
    originalSubject: message.subject,
    replyBody: parsed.data.body,
    fromName,
  });

  const result = await sendEmail({ to: message.email, ...template });
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Failed to send email" }, { status: 500 });
  }

  // Mark as read + store the reply body + timestamp
  const updated = await prisma.contactMessage.update({
    where: { id },
    data: {
      isRead: true,
      repliedAt: new Date(),
      replyBody: parsed.data.body,
    },
  });

  return NextResponse.json({
    ok: true,
    repliedAt: updated.repliedAt,
    replyBody: updated.replyBody,
  });
}
