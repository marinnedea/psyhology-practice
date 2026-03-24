import { prisma } from "@/lib/db";
import Link from "next/link";
import { sanitizeText, sanitizeHtml } from "@/lib/sanitize";

export const metadata = {
  title: "About Us | MindBridge",
  description: "Learn about our mission, values, and the team of qualified psychologists behind MindBridge.",
};

// ── Default content (used when DB has no rows) ────────────────────────────────

const DEFAULT_HERO = {
  title: "About MindBridge",
  subtitle: "We connect people with qualified, compassionate psychologists — making quality mental health care accessible to everyone.",
};

const DEFAULT_STORY = {
  title: "How MindBridge Began",
  content: "MindBridge was born from a simple but powerful belief: that everyone deserves access to quality mental health care, without barriers, without stigma, and without complexity. We started as a small team of psychologists and technologists who noticed that too many people were struggling to find the right support. Today, we're proud to connect thousands of people with qualified professionals who genuinely care.",
};

const DEFAULT_MISSION = {
  title: "Making quality mental health care accessible to all",
  content: "We set out to remove the barriers that prevent people from getting the psychological support they need. Whether it's finding the right specialist, fitting therapy around a busy schedule, or simply taking that first step — we make it easier.",
};

const DEFAULT_VALUES = {
  title: "What guides everything we do",
  subtitle: "",
  items: [
    { title: "Trust & Safety",     description: "Every psychologist on our platform is fully vetted and approved. Your safety and privacy are non-negotiable." },
    { title: "Compassion First",   description: "We approach every interaction with empathy, understanding that seeking help takes courage." },
    { title: "Proven Methods",     description: "Our professionals use evidence-based, clinically validated therapeutic approaches." },
    { title: "Confidentiality",    description: "Everything shared between you and your psychologist stays between you and your psychologist." },
    { title: "Accessibility",      description: "Online and in-person options ensure that quality care is never out of reach." },
    { title: "Continuous Growth",  description: "We invest in ongoing professional development for all practitioners on our platform." },
  ],
};

const DEFAULT_TEAM = {
  title: "Meet Our Psychologists",
  subtitle: "Qualified, experienced, and passionate professionals dedicated to your well-being. Every member of our team has been carefully selected for their expertise, empathy, and commitment.",
};

const DEFAULT_CTA = {
  title: "Ready to start your journey?",
  subtitle: "Join our community and take the first step toward better mental health.",
  button1: { text: "Find a Psychologist", href: "/psychologists" },
  button2: { text: "Get in Touch",        href: "/contact" },
  gradient: "from-indigo-600 to-indigo-800",
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function AboutPage() {
  const [rawSections, team] = await Promise.all([
    prisma.pageSection.findMany({
      where: { page: "about" },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.psychologistProfile.findMany({
      where: { user: { isApproved: true } },
      include: { user: { select: { name: true } }, profileImage: true },
      take: 12,
    }),
  ]);

  function sec(key: string) {
    return rawSections.find((s) => s.sectionKey === key);
  }

  // ── Hero ──────────────────────────────────────────────────────────────────
  const heroSec = sec("hero");
  const hero = {
    title:    heroSec?.title    ?? DEFAULT_HERO.title,
    subtitle: heroSec?.subtitle ?? DEFAULT_HERO.subtitle,
    visible:  heroSec?.isVisible ?? true,
  };

  // ── Our Story ─────────────────────────────────────────────────────────────
  const storySec = sec("our_story");
  const storyMeta = (storySec?.metadata ?? {}) as { imageUrl?: string };
  const story = {
    title:    storySec?.title   ?? DEFAULT_STORY.title,
    content:  storySec?.content ?? DEFAULT_STORY.content,
    imageUrl: storyMeta.imageUrl ?? "",
    visible:  storySec?.isVisible ?? true,
  };

  // ── Our Mission ───────────────────────────────────────────────────────────
  const missionSec = sec("our_mission");
  const missionMeta = (missionSec?.metadata ?? {}) as { imageUrl?: string };
  const mission = {
    title:    missionSec?.title   ?? DEFAULT_MISSION.title,
    content:  missionSec?.content ?? DEFAULT_MISSION.content,
    imageUrl: missionMeta.imageUrl ?? "",
    visible:  missionSec?.isVisible ?? true,
  };

  // ── Core Values ───────────────────────────────────────────────────────────
  const valuesSec = sec("core_values");
  const valuesMeta = (valuesSec?.metadata ?? {}) as { items?: { title: string; description: string }[] };
  const values = {
    title:   valuesSec?.title    ?? DEFAULT_VALUES.title,
    subtitle: valuesSec?.subtitle ?? DEFAULT_VALUES.subtitle,
    items:   valuesMeta.items    ?? DEFAULT_VALUES.items,
    visible: valuesSec?.isVisible ?? true,
  };

  // ── Team ──────────────────────────────────────────────────────────────────
  const teamSec = sec("team");
  const teamData = {
    title:    teamSec?.title    ?? DEFAULT_TEAM.title,
    subtitle: teamSec?.subtitle ?? DEFAULT_TEAM.subtitle,
    visible:  teamSec?.isVisible ?? true,
  };

  // ── CTA ───────────────────────────────────────────────────────────────────
  const ctaSec = sec("cta");
  const ctaMeta = (ctaSec?.metadata ?? {}) as {
    button1?: { text: string; href: string };
    button2?: { text: string; href: string };
    gradient?: string;
  };
  const cta = {
    title:    ctaSec?.title    ?? DEFAULT_CTA.title,
    subtitle: ctaSec?.subtitle ?? DEFAULT_CTA.subtitle,
    button1:  ctaMeta.button1  ?? DEFAULT_CTA.button1,
    button2:  ctaMeta.button2  ?? DEFAULT_CTA.button2,
    gradient: ctaMeta.gradient ?? DEFAULT_CTA.gradient,
    visible:  ctaSec?.isVisible ?? true,
  };

  return (
    <div>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      {hero.visible && (
        <section className="bg-gradient-to-br from-slate-50 to-indigo-50 py-16 px-4 border-b border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">
              Who We Are
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {hero.title}
            </h1>
            <div
              className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed prose prose-gray prose-lg mx-auto"
              dangerouslySetInnerHTML={{ __html: sanitizeText(hero.subtitle) }}
            />
          </div>
        </section>
      )}

      {/* ── Our Story ───────────────────────────────────────────────── */}
      {story.visible && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-4">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {story.title}
              </h2>
              <div
                className="text-lg text-gray-600 leading-relaxed prose prose-gray prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(story.content) }}
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg h-72 md:h-80">
              {story.imageUrl ? (
                <img src={story.imageUrl} alt="Our story" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center">
                  <svg className="w-20 h-20 text-indigo-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Our Mission ─────────────────────────────────────────────── */}
      {mission.visible && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-md h-64 order-2 md:order-1">
              {mission.imageUrl ? (
                <img src={mission.imageUrl} alt="Our mission" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="order-1 md:order-2">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Our Mission</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-5 leading-snug">
                {mission.title}
              </h2>
              <div
                className="text-gray-600 leading-relaxed prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(mission.content) }}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Core Values ─────────────────────────────────────────────── */}
      {values.visible && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Our Values</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3">
                {values.title}
              </h2>
              {values.subtitle && (
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto leading-relaxed">{values.subtitle}</p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.items.map((v) => (
                <div key={v.title} className="bg-gray-50 rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Meet Our Team ───────────────────────────────────────────── */}
      {teamData.visible && team.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Our Team</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3">
                {teamData.title}
              </h2>
              {teamData.subtitle && (
                <p className="text-gray-600 mt-4 max-w-xl mx-auto leading-relaxed">{teamData.subtitle}</p>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {team.map((member) => (
                <Link key={member.id} href={`/psychologists/${member.id}`} className="text-center group">
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden ring-2 ring-gray-200 group-hover:ring-indigo-400 transition-all">
                    {member.profileImage ? (
                      <img src={member.profileImage.localPath} alt={member.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-600">{member.user.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors leading-tight">
                    {member.user.name}
                  </p>
                  {member.specialties.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1 leading-tight">{member.specialties[0]}</p>
                  )}
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/psychologists" className="inline-block border border-indigo-600 text-indigo-600 px-7 py-3 rounded-xl hover:bg-indigo-50 transition-colors font-semibold">
                View All Psychologists
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      {cta.visible && (
        <section className={`py-16 px-4 bg-gradient-to-r ${cta.gradient}`}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">{cta.title}</h2>
            {cta.subtitle && (
              <div
                className="text-indigo-100 mb-8 text-lg prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeText(cta.subtitle) }}
              />
            )}
            <div className="flex gap-4 justify-center flex-wrap">
              {cta.button1.text && (
                <Link href={cta.button1.href || "#"} className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
                  {cta.button1.text}
                </Link>
              )}
              {cta.button2.text && (
                <Link href={cta.button2.href || "#"} className="border border-white/60 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  {cta.button2.text}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
