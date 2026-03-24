import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AvailabilityForm from "./AvailabilityForm";

export default async function AvailabilityPage() {
  const user = await requireRole("PSYCHOLOGIST");

  const profile = await prisma.psychologistProfile.findUnique({
    where: { userId: user.id },
    include: { availabilities: true },
  });

  const availabilities = profile?.availabilities ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Availability</h1>
        <p className="text-gray-500 text-sm mt-1">
          Set the days and hours when you are available for appointments.
        </p>
      </div>
      <AvailabilityForm availabilities={availabilities} />
    </div>
  );
}
