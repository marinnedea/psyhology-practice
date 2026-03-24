import { prisma } from "@/lib/db";
import Link from "next/link";
import SpecialtySidebar from "@/components/psychologists/SpecialtySidebar";

export const metadata = {
  title: "Find a Psychologist",
  description: "Browse our network of qualified, approved psychologists and book a session today.",
};

export default async function PsychologistsPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string }>;
}) {
  const { specialty } = await searchParams;

  const profiles = await prisma.psychologistProfile.findMany({
    where: {
      user: { isApproved: true },
      ...(specialty ? { specialties: { has: specialty } } : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      profileImage: true,
      availabilities: { where: { isActive: true } },
      psychologistServices: {
        include: { service: true },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  const allProfiles = await prisma.psychologistProfile.findMany({
    where: { user: { isApproved: true } },
    select: { specialties: true },
  });
  const allSpecialties = Array.from(
    new Set(allProfiles.flatMap((p) => p.specialties))
  ).sort();

  // Count how many approved psychologists have each specialty
  const countBySpecialty = allProfiles.reduce<Record<string, number>>((acc, p) => {
    p.specialties.forEach((s) => {
      acc[s] = (acc[s] ?? 0) + 1;
    });
    return acc;
  }, {});

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50 py-16 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">
            Our Professionals
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find a Psychologist
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            All our psychologists are fully qualified, vetted, and approved.
            Browse profiles and find the right match for you.
          </p>
        </div>
      </section>

      {/* Mobile filter strip */}
      {allSpecialties.length > 0 && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 items-center whitespace-nowrap">
            <Link
              href="/psychologists"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                !specialty ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              All
            </Link>
            {allSpecialties.map((s) => (
              <Link
                key={s}
                href={`/psychologists?specialty=${encodeURIComponent(s)}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                  specialty === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main layout: sidebar + content */}
      <div className="py-12 px-4 bg-gray-50 min-h-[60vh]">
        <div className="max-w-5xl mx-auto flex gap-8 items-start">

          {/* Sidebar — desktop only */}
          {allSpecialties.length > 0 && (
            <aside className="hidden md:block w-56 shrink-0 sticky top-24 self-start">
              <SpecialtySidebar
                allSpecialties={allSpecialties}
                countBySpecialty={countBySpecialty}
                totalCount={allProfiles.length}
                currentSpecialty={specialty}
              />
            </aside>
          )}

          {/* Cards */}
          <div className="flex-1 min-w-0">
            {specialty && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-gray-600">
                  <strong>{profiles.length}</strong> psychologist{profiles.length !== 1 ? "s" : ""} for
                </span>
                <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                  {specialty}
                  <Link href="/psychologists" className="ml-1 hover:text-indigo-600" aria-label="Clear filter">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Link>
                </span>
              </div>
            )}

            {profiles.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => {
                  const activeDays = profile.availabilities.map(
                    (a) => DAY_NAMES[a.dayOfWeek]
                  );
                  return (
                    <div
                      key={profile.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                    >
                      <div className="h-44 overflow-hidden bg-gradient-to-br from-indigo-100 to-blue-100">
                        {profile.profileImage ? (
                          <img
                            src={profile.profileImage.localPath}
                            alt={profile.user.name}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                              {profile.user.name.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h2 className="text-base font-bold text-gray-900">
                          {profile.user.name}
                        </h2>

                        {profile.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                            {profile.specialties.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium"
                              >
                                {s}
                              </span>
                            ))}
                            {profile.specialties.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{profile.specialties.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {profile.bio && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                            {profile.bio}
                          </p>
                        )}

                        {profile.location && (
                          <p className="text-gray-500 text-xs mt-3 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {profile.location}
                          </p>
                        )}

                        {activeDays.length > 0 && (
                          <p className="text-gray-400 text-xs mt-1">
                            Available: {activeDays.join(", ")}
                          </p>
                        )}

                        <Link
                          href={`/psychologists/${profile.id}`}
                          className="mt-4 block text-center bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          View Profile &amp; Book
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {specialty ? `No psychologists found for "${specialty}"` : "No psychologists yet"}
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  {specialty ? "Try a different specialty or browse all professionals." : "Our team is growing. Check back soon."}
                </p>
                {specialty && (
                  <Link href="/psychologists" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    View All Psychologists
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join CTA */}
      <section className="py-16 px-4 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Are you a psychologist?</h2>
          <p className="text-gray-600 mb-6">Join our platform and connect with clients who need your expertise.</p>
          <Link
            href="/register/psychologist"
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            Apply to Join
          </Link>
        </div>
      </section>
    </div>
  );
}
