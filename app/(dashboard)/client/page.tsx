import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-gray-100 text-gray-700",
};

export default async function ClientDashboard() {
  const user = await requireRole("CLIENT");
  const now = new Date();

  const [totalCount, upcomingCount, upcomingAppointments] = await Promise.all([
    prisma.appointment.count({ where: { clientId: user.id } }),
    prisma.appointment.count({
      where: {
        clientId: user.id,
        dateTime: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    prisma.appointment.findMany({
      where: {
        clientId: user.id,
        dateTime: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { dateTime: "asc" },
      take: 3,
      include: {
        psychologist: { select: { name: true } },
        service: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your dashboard overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Appointments</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Upcoming Appointments</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {upcomingCount}
          </p>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
          <Link
            href="/client/appointments"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <p className="text-gray-500 text-sm">
              You have no upcoming appointments.
            </p>
            <Link
              href="/psychologists"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Find a Psychologist
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcomingAppointments.map((appt) => (
              <div key={appt.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {appt.psychologist.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {appt.service?.name ?? "Appointment"} ·{" "}
                    {formatDate(appt.dateTime)}
                  </p>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[appt.status]}`}
                >
                  {appt.status}
                </span>
              </div>
            ))}
            <div className="px-5 py-3">
              <Link
                href="/psychologists"
                className="text-sm text-blue-600 hover:underline"
              >
                + Book another appointment
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
