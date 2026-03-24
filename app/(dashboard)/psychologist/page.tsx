import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getProfileCompleteness(
  profile: {
    bio: string | null;
    location: string | null;
    phone: string | null;
    specialties: string[];
    studies: string | null;
    qualifications: string | null;
    websiteUrl: string | null;
    linkedinUrl: string | null;
    psychologistServices: { id: string }[];
  } | null
): number {
  if (!profile) return 0;
  const checks = [
    !!profile.bio,
    !!profile.location,
    !!profile.phone,
    profile.specialties.length > 0,
    !!profile.studies,
    !!profile.qualifications,
    !!(profile.websiteUrl || profile.linkedinUrl),
    profile.psychologistServices.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default async function PsychologistDashboard() {
  const user = await requireRole("PSYCHOLOGIST");

  const now = new Date();

  const [upcomingCount, publishedCount, draftCount, profile, upcomingAppointments] =
    await Promise.all([
      prisma.appointment.count({
        where: {
          psychologistId: user.id,
          dateTime: { gte: now },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),
      prisma.blogPost.count({
        where: { authorId: user.id, status: "PUBLISHED" },
      }),
      prisma.blogPost.count({
        where: { authorId: user.id, status: "DRAFT" },
      }),
      prisma.psychologistProfile.findUnique({
        where: { userId: user.id },
        include: {
          psychologistServices: true,
        },
      }),
      prisma.appointment.findMany({
        where: {
          psychologistId: user.id,
          dateTime: { gte: now },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        orderBy: { dateTime: "asc" },
        take: 5,
        include: {
          client: { select: { name: true, email: true } },
          service: { select: { name: true } },
        },
      }),
    ]);

  const profileCompleteness = getProfileCompleteness(profile);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s an overview of your practice.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Upcoming Appointments</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {upcomingCount}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Published Posts</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {publishedCount}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Draft Posts</p>
          <p className="text-3xl font-bold text-gray-500 mt-1">{draftCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Profile Completeness</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {profileCompleteness}%
          </p>
        </div>
      </div>

      {/* Profile completeness bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-700">
            Profile Completeness
          </h2>
          <span className="text-sm text-gray-500">{profileCompleteness}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${profileCompleteness}%` }}
          />
        </div>
        {profileCompleteness < 100 && (
          <p className="text-xs text-gray-500 mt-2">
            Complete your profile to attract more clients.{" "}
            <Link
              href="/psychologist/profile"
              className="text-blue-600 hover:underline"
            >
              Update profile →
            </Link>
          </p>
        )}
      </div>

      {/* Upcoming appointments table */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Next 5 Upcoming Appointments
          </h2>
          <Link
            href="/psychologist/appointments"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {upcomingAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No upcoming appointments.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
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
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appt) => (
                  <tr
                    key={appt.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/psychologist/profile"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Edit Profile
          </Link>
          <Link
            href="/psychologist/availability"
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            Manage Availability
          </Link>
          <Link
            href="/psychologist/blog/new"
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            + New Blog Post
          </Link>
        </div>
      </div>
    </div>
  );
}
