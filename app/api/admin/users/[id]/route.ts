import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user;
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isApproved: true,
      createdAt: true,
      updatedAt: true,
      psychologistProfile: {
        select: {
          bio: true,
          location: true,
          phone: true,
          specialties: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, isApproved: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role === "ADMIN") {
    return NextResponse.json(
      { error: "Cannot modify another admin user." },
      { status: 403 }
    );
  }

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;

  if (!action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  if (action === "approve") {
    const updated = await prisma.user.update({
      where: { id },
      data: { isApproved: true },
      select: { id: true, name: true, email: true, role: true, isApproved: true },
    });
    return NextResponse.json(updated);
  }

  if (action === "toggle_approved") {
    const updated = await prisma.user.update({
      where: { id },
      data: { isApproved: !target.isApproved },
      select: { id: true, name: true, email: true, role: true, isApproved: true },
    });
    return NextResponse.json(updated);
  }

  if (action === "reset_password") {
    const tempPassword = randomBytes(10).toString("hex"); // 20-char random hex
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
    return NextResponse.json({ success: true, tempPassword });
  }

  if (action === "update") {
    const { name, email, role, isApproved: newApproved, newPassword } = body as {
      action: string;
      name?: string;
      email?: string;
      role?: string;
      isApproved?: boolean;
      newPassword?: string;
    };

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) {
      const dup = await prisma.user.findFirst({ where: { email, NOT: { id } } });
      if (dup) {
        return NextResponse.json({ error: "Email already in use by another user." }, { status: 409 });
      }
      updateData.email = email;
    }
    if (role && ["ADMIN", "PSYCHOLOGIST", "CLIENT"].includes(role)) {
      updateData.role = role;
    }
    if (newApproved !== undefined) updateData.isApproved = newApproved;
    if (newPassword && newPassword.length >= 6) {
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isApproved: true },
    });

    // If role changed to PSYCHOLOGIST, ensure profile exists
    if (role === "PSYCHOLOGIST") {
      const existingProfile = await prisma.psychologistProfile.findUnique({ where: { userId: id } });
      if (!existingProfile) {
        await prisma.psychologistProfile.create({ data: { userId: id, specialties: [] } });
      }
    }

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
