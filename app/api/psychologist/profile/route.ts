import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getPsychSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PSYCHOLOGIST") return null;
  return session.user;
}

export async function GET() {
  const user = await getPsychSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.psychologistProfile.findUnique({
    where: { userId: user.id },
    include: {
      psychologistServices: { include: { service: true } },
    },
  });

  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const user = await getPsychSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    bio?: string;
    location?: string;
    phone?: string;
    specialties?: string[];
    studies?: string;
    qualifications?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    services?: { serviceId: string; customPrice: number | null }[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    bio,
    location,
    phone,
    specialties,
    studies,
    qualifications,
    websiteUrl,
    linkedinUrl,
    facebookUrl,
    instagramUrl,
    services,
  } = body;

  // Upsert the profile
  const profile = await prisma.psychologistProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      bio: bio ?? null,
      location: location ?? null,
      phone: phone ?? null,
      specialties: specialties ?? [],
      studies: studies ?? null,
      qualifications: qualifications ?? null,
      websiteUrl: websiteUrl ?? null,
      linkedinUrl: linkedinUrl ?? null,
      facebookUrl: facebookUrl ?? null,
      instagramUrl: instagramUrl ?? null,
    },
    update: {
      bio: bio ?? null,
      location: location ?? null,
      phone: phone ?? null,
      specialties: specialties ?? [],
      studies: studies ?? null,
      qualifications: qualifications ?? null,
      websiteUrl: websiteUrl ?? null,
      linkedinUrl: linkedinUrl ?? null,
      facebookUrl: facebookUrl ?? null,
      instagramUrl: instagramUrl ?? null,
    },
  });

  // Handle services
  if (Array.isArray(services)) {
    const incoming = services as { serviceId: string; customPrice: number | null }[];
    const incomingIds = incoming.map((s) => s.serviceId);

    // Delete removed services
    await prisma.psychologistService.deleteMany({
      where: {
        psychologistId: profile.id,
        serviceId: { notIn: incomingIds },
      },
    });

    // Upsert each service
    for (const svc of incoming) {
      await prisma.psychologistService.upsert({
        where: {
          psychologistId_serviceId: {
            psychologistId: profile.id,
            serviceId: svc.serviceId,
          },
        },
        create: {
          psychologistId: profile.id,
          serviceId: svc.serviceId,
          customPrice: svc.customPrice ?? null,
        },
        update: {
          customPrice: svc.customPrice ?? null,
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}
