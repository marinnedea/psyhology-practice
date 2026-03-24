import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

const PSYCHOLOGIST_ALLOWED_STATUSES = ["CONFIRMED", "COMPLETED", "CANCELLED"];
const CLIENT_ALLOWED_STATUSES = ["CANCELLED"];

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { status: newStatus } = body;
  if (!newStatus) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const userId = session.user.id;
  const role = session.user.role;

  const isPsychologist =
    role === "PSYCHOLOGIST" && appointment.psychologistId === userId;
  const isClient = role === "CLIENT" && appointment.clientId === userId;

  if (!isPsychologist && !isClient) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate allowed status transitions
  if (isPsychologist && !PSYCHOLOGIST_ALLOWED_STATUSES.includes(newStatus)) {
    return NextResponse.json(
      { error: `Psychologists can only set status to: ${PSYCHOLOGIST_ALLOWED_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  if (isClient) {
    if (!CLIENT_ALLOWED_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: "Clients can only cancel appointments." },
        { status: 400 }
      );
    }
    // Client can only cancel future appointments
    if (appointment.dateTime <= new Date()) {
      return NextResponse.json(
        { error: "Cannot cancel a past appointment." },
        { status: 400 }
      );
    }
    // Must be PENDING or CONFIRMED
    if (appointment.status !== "PENDING" && appointment.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Only pending or confirmed appointments can be cancelled." },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: newStatus as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" },
  });

  return NextResponse.json(updated);
}
