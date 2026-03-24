import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user;
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }

  let body: { isActive?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.isActive === undefined) {
    return NextResponse.json({ error: "isActive is required." }, { status: 400 });
  }

  const updated = await prisma.newsletterSubscriber.update({
    where: { id },
    data: {
      isActive: body.isActive,
      unsubscribedAt: body.isActive ? null : new Date(),
    },
  });

  return NextResponse.json(updated);
}
