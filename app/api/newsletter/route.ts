import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { newsletterLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  email: z.email("Invalid email address"),
});

export async function POST(req: Request) {
  const rl = newsletterLimiter.check(getClientIp(req));
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Upsert — re-activates if previously unsubscribed
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, isActive: true },
      update: { isActive: true, unsubscribedAt: null },
    });

    return NextResponse.json({ message: "Subscribed successfully." }, { status: 201 });
  } catch (err) {
    console.error("Newsletter error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
