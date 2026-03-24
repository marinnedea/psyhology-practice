import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import CancelButton from "@/components/dashboard/CancelButton";

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

export default async function ClientAppointmentsPage() {
  const user = await requireRole("CLIENT");
  const now = new Date();

  const appointments = await prisma.appointment.findMany({
    where: { clientId: user.id },
    orderBy: [{ dateTime: "asc" }],
    include: {
      psychologist: { select: { name: true } },
      service: { select: { name: true } },
    },
  });

  const upcoming = appointments.filter(
    (a) => a.dateTime >= now && (a.status === "PENDING" || a.status === "CONFIRMED")
  );
  const others = appointments.filter(
    (a) => !(a.dateTime >= now && (a.status === "PENDING" || a.status === "CONFIRMED"))
  );
  const sorted = [...upcoming, ...others.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime())];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">
          View and manage all your appointments.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 text-sm">
          You have no appointments yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Psychologist
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
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((appt) => {
                  const canCancel =
                    (appt.status === "PENDING" || appt.status === "CONFIRMED") &&
                    appt.dateTime >= now;
                  return (
                    <tr
                      key={appt.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {appt.psychologist.name}
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
                      <td className="px-5 py-3">
                        {canCancel ? (
                          <CancelButton appointmentId={appt.id} />
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
