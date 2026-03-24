import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const user = await requireRole("PSYCHOLOGIST");

  const [profile, allServices] = await Promise.all([
    prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
      include: {
        availabilities: true,
        psychologistServices: {
          include: { service: true },
        },
      },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Update your public profile information.
        </p>
      </div>
      <ProfileForm profile={profile} allServices={allServices} />
    </div>
  );
}
