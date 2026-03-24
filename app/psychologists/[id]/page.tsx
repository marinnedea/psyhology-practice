import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await prisma.psychologistProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return { title: "Not Found" };
  return {
    title: profile.user.name,
    description: profile.bio?.slice(0, 155) ?? `Book a session with ${profile.user.name}.`,
  };
}

export default async function PsychologistProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await prisma.psychologistProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, isApproved: true } },
      profileImage: true,
      availabilities: { where: { isActive: true }, orderBy: { dayOfWeek: "asc" } },
      psychologistServices: {
        include: { service: true },
      },
    },
  });

  if (!profile || !profile.user.isApproved) notFound();

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/psychologists" className="text-sm text-blue-600 hover:underline mb-6 inline-flex items-center gap-1">
          ← Back to all psychologists
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 mt-4">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 h-48 flex items-center justify-center">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage.localPath}
                    alt={profile.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900">{profile.user.name}</h1>

                {profile.location && (
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {profile.location}
                  </p>
                )}

                {profile.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {profile.specialties.map((s) => (
                      <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Social links */}
                <div className="flex gap-3 mt-4">
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                <Link
                  href="/register"
                  className="mt-6 block text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Book a Session
                </Link>
              </div>
            </div>

            {/* Availability */}
            {profile.availabilities.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>
                <ul className="space-y-2">
                  {profile.availabilities.map((a) => (
                    <li key={a.id} className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">{DAY_NAMES[a.dayOfWeek]}</span>
                      <span className="text-gray-500">{a.startTime} – {a.endTime}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {profile.bio && (
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </div>
            )}

            {/* Education & Qualifications */}
            {(profile.studies || profile.qualifications) && (
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Education & Qualifications</h2>
                {profile.studies && (
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Studies</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.studies}</p>
                  </div>
                )}
                {profile.qualifications && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Qualifications</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.qualifications}</p>
                  </div>
                )}
              </div>
            )}

            {/* Services offered */}
            {profile.psychologistServices.filter((ps) => ps.service.isActive).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Services Offered</h2>
                <div className="space-y-4">
                  {profile.psychologistServices.filter((ps) => ps.service.isActive).map((ps) => (
                    <div key={ps.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{ps.service.name}</p>
                        <p className="text-sm text-gray-500">{ps.service.duration} min</p>
                      </div>
                      <span className="text-blue-600 font-bold">
                        €{Number(ps.customPrice ?? ps.service.price).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact / Book */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Ready to get started?
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Create a free account to book a session with {profile.user.name}.
              </p>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
              >
                Register &amp; Book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
