import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user;
}

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name?: string;
    description?: string | null;
    price?: number;
    duration?: number;
    sortOrder?: number;
    isActive?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description, price, duration, sortOrder, isActive } = body;

  if (!name || price === undefined || price === null || !duration) {
    return NextResponse.json(
      { error: "name, price, and duration are required." },
      { status: 400 }
    );
  }

  if (isNaN(Number(price)) || Number(price) < 0) {
    return NextResponse.json({ error: "price must be a positive number." }, { status: 400 });
  }

  if (!Number.isInteger(duration) || duration < 1) {
    return NextResponse.json({ error: "duration must be a positive integer (minutes)." }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      name,
      description: description ?? null,
      price,
      duration,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
