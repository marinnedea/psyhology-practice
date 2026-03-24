import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { compare, hash } from "bcryptjs";

async function getClientSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CLIENT") return null;
  return session.user;
}

export async function PUT(req: NextRequest) {
  const user = await getClientSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    changePassword?: boolean;
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.changePassword) {
    // Change password flow
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "currentPassword and newPassword are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await compare(currentPassword, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const newHash = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true });
  }

  // Update name/email flow
  const { name, email } = body;
  if (!name && !email) {
    return NextResponse.json(
      { error: "At least one of name or email must be provided." },
      { status: 400 }
    );
  }

  // Check email uniqueness if changing
  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email, id: { not: user.id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This email is already in use." },
        { status: 409 }
      );
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
    },
  });

  return NextResponse.json({ success: true });
}
