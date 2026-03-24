import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getPsychSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PSYCHOLOGIST") return null;
  return session.user;
}

export async function PUT(req: NextRequest) {
  const user = await getPsychSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[];
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Expected an array" }, { status: 400 });
  }

  // Ensure the profile exists
  const profile = await prisma.psychologistProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, specialties: [] },
    update: {},
  });

  // Delete all existing availabilities
  await prisma.availability.deleteMany({
    where: { psychologistId: profile.id },
  });

  // Recreate active ones
  const activeEntries = body.filter((entry) => entry.isActive);
  if (activeEntries.length > 0) {
    await prisma.availability.createMany({
      data: activeEntries.map((entry) => ({
        psychologistId: profile.id,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        isActive: true,
      })),
    });
  }

  return NextResponse.json({ success: true });
}
