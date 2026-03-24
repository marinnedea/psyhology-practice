import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import AppointmentActions from "@/components/dashboard/AppointmentActions";

type SearchParams = Promise<{ tab?: string }>;

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

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireRole("PSYCHOLOGIST");
  const params = await searchParams;
  const tab = params.tab === "past" ? "past" : "upcoming";
  const now = new Date();

  const appointments = await prisma.appointment.findMany({
    where:
      tab === "upcoming"
        ? {
            psychologistId: user.id,
            dateTime: { gte: now },
          }
        : {
            psychologistId: user.id,
            dateTime: { lt: now },
          },
    orderBy: { dateTime: tab === "upcoming" ? "asc" : "desc" },
    include: {
      client: { select: { id: true, name: true, email: true } },
      service: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your upcoming and past appointments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <Link
          href="/psychologist/appointments"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "upcoming"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Upcoming
        </Link>
        <Link
          href="/psychologist/appointments?tab=past"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "past"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Past
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 text-sm">
          No {tab} appointments.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Client
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Service
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Date &amp; Time
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  {tab === "upcoming" && (
                    <th className="text-left px-5 py-3 font-medium text-gray-600">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr
                    key={appt.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">
                        {appt.client.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {appt.client.email}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {appt.service?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {formatDate(appt.dateTime)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[appt.status]}`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    {tab === "upcoming" && (
                      <td className="px-5 py-3">
                        <AppointmentActions
                          appointmentId={appt.id}
                          status={appt.status}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
