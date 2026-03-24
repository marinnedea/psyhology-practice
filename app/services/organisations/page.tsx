import { prisma } from "@/lib/db";
import Link from "next/link";

export const metadata = {
  title: "Services for Organisations | MindBridge",
  description:
    "Psychological services tailored for organisations — workplace assessments, employee wellbeing programmes, leadership coaching, and crisis support.",
};

// ── Inline icons ───────────────────────────────────────────────────────────────

function IconHeart() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
function IconLightbulb() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}
function IconLifebuoy() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function getIcon(name: string) {
  switch (name) {
    case "heart":     return <IconHeart />;
    case "users":     return <IconUsers />;
    case "shield":    return <IconShield />;
    case "chart":     return <IconChart />;
    case "star":      return <IconStar />;
    case "bolt":      return <IconBolt />;
    case "building":  return <IconBuilding />;
    case "lightbulb": return <IconLightbulb />;
    case "lifebuoy":  return <IconLifebuoy />;
    case "check":     return <IconCheck />;
    default:          return <IconStar />;
  }
}

// ── Default section data ───────────────────────────────────────────────────────

const DEFAULT_HERO = {
  title: "Psychological Services for Organisations",
  subtitle: "Investing in your people's mental health is one of the highest-return decisions a company can make. We offer a suite of evidence-based programmes designed for teams of all sizes.",
  primaryCta: { text: "Request a Proposal", href: "/contact" },
  secondaryCta: { text: "View All Services", href: "/services" },
};

const DEFAULT_INTRO = {
  title: "Why Organisational Psychology?",
  subtitle: "Organisations that prioritise psychological wellbeing see measurable improvements in retention, productivity, and culture.",
  content: "Mental health challenges cost organisations billions annually through absenteeism, presenteeism, and high turnover. Our clinical team works directly with HR leaders and executives to design bespoke programmes — from one-off workshops to ongoing EAP partnerships — that deliver real, measurable results for your people and your bottom line.",
};

const DEFAULT_SERVICES_LIST = {
  title: "Our Corporate Services",
  subtitle: "A full range of organisation-focused psychological services, delivered by chartered psychologists and accredited therapists.",
  items: [
    { iconName: "chart",     title: "Workplace Psychological Assessment",  description: "Structured evaluations of individual and team wellbeing, identifying risk factors, burnout indicators, and opportunities for organisational growth." },
    { iconName: "heart",     title: "Employee Psychotherapy",              description: "Confidential one-on-one therapy sessions for staff, available as part of an Employee Assistance Programme (EAP) or direct referral scheme." },
    { iconName: "users",     title: "Resilience & Wellbeing Workshops",    description: "Interactive group sessions covering stress management, emotional regulation, communication skills, and burnout prevention — led by our clinical team." },
    { iconName: "lightbulb", title: "Team Building with Specialists",      description: "Purposeful team experiences built around psychological safety, trust, and healthy communication — facilitated by our psychologists, not event coordinators." },
    { iconName: "star",      title: "Leadership & Executive Coaching",     description: "Individual coaching for managers and senior leaders on emotional intelligence, decision-making under pressure, and sustainable high performance." },
    { iconName: "lifebuoy",  title: "Crisis & Critical Incident Support",  description: "Rapid-response psychological support for teams following traumatic events, major organisational change, or acute workplace stress situations." },
  ],
};

const DEFAULT_WHY_PARTNER = {
  title: "Why Partner with MindBridge?",
  subtitle: "We are not a box-ticking exercise. We are a clinical team committed to meaningful change in your organisation.",
  items: [
    { iconName: "shield",    title: "Qualified & Vetted Clinicians",      description: "All our psychologists hold recognised professional qualifications and undergo rigorous vetting — no coaches pretending to be therapists." },
    { iconName: "users",     title: "Tailored to Your Organisation",      description: "No off-the-shelf packages. Every engagement is scoped to your organisation's specific context, culture, and goals." },
    { iconName: "chart",     title: "Measurable Outcomes",                description: "Pre and post assessments, anonymised reporting, and actionable recommendations delivered after every programme." },
    { iconName: "bolt",      title: "Flexible Delivery",                  description: "On-site, online, or hybrid delivery. We work around your team's schedule — not the other way around." },
    { iconName: "heart",     title: "Confidential & GDPR Compliant",      description: "Full data protection, clinical confidentiality, and GDPR compliance built in from day one." },
    { iconName: "star",      title: "Scalable from 5 to 500+",            description: "Whether you have a small management team or a large enterprise, our programmes scale to fit your headcount and budget." },
  ],
};

const DEFAULT_CTA = {
  badge: "Let's Talk",
  title: "Ready to Invest\nin Your People?",
  subtitle: "Book a no-obligation call with our team to discuss your organisation's needs. We'll put together a tailored proposal within 2 business days.",
  button1: { text: "Request a Proposal", href: "/contact" },
  button2: { text: "Contact Us",         href: "/contact" },
  button3: { text: "View Our Services",  href: "/services" },
  gradient: "from-indigo-600 to-indigo-800",
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function OrganisationsPage() {
  const rawSections = await prisma.pageSection.findMany({
    where: { page: "services_organisations" },
    orderBy: { sortOrder: "asc" },
  });

  function sec(key: string) {
    return rawSections.find((s) => s.sectionKey === key);
  }

  // ── Hero ──────────────────────────────────────────────────────────────────
  const heroSec = sec("hero");
  const heroMeta = (heroSec?.metadata ?? {}) as {
    primaryCta?: { text: string; href: string };
    secondaryCta?: { text: string; href: string };
  };
  const hero = {
    title:        heroSec?.title        ?? DEFAULT_HERO.title,
    subtitle:     heroSec?.subtitle     ?? DEFAULT_HERO.subtitle,
    primaryCta:   heroMeta.primaryCta   ?? DEFAULT_HERO.primaryCta,
    secondaryCta: heroMeta.secondaryCta ?? DEFAULT_HERO.secondaryCta,
    visible:      heroSec?.isVisible    ?? true,
  };

  // ── Intro ─────────────────────────────────────────────────────────────────
  const introSec = sec("intro");
  const intro = {
    title:   introSec?.title    ?? DEFAULT_INTRO.title,
    subtitle: introSec?.subtitle ?? DEFAULT_INTRO.subtitle,
    content:  introSec?.content  ?? DEFAULT_INTRO.content,
    visible:  introSec?.isVisible ?? true,
  };

  // ── Services List ─────────────────────────────────────────────────────────
  const servicesSec = sec("services_list");
  const servicesMeta = (servicesSec?.metadata ?? {}) as {
    items?: { iconName: string; title: string; description: string }[];
  };
  const servicesList = {
    title:   servicesSec?.title    ?? DEFAULT_SERVICES_LIST.title,
    subtitle: servicesSec?.subtitle ?? DEFAULT_SERVICES_LIST.subtitle,
    items:   servicesMeta.items    ?? DEFAULT_SERVICES_LIST.items,
    visible: servicesSec?.isVisible ?? true,
  };

  // ── Why Partner ───────────────────────────────────────────────────────────
  const whySec = sec("why_partner");
  const whyMeta = (whySec?.metadata ?? {}) as {
    items?: { iconName: string; title: string; description: string }[];
  };
  const whyPartner = {
    title:   whySec?.title    ?? DEFAULT_WHY_PARTNER.title,
    subtitle: whySec?.subtitle ?? DEFAULT_WHY_PARTNER.subtitle,
    items:   whyMeta.items    ?? DEFAULT_WHY_PARTNER.items,
    visible: whySec?.isVisible ?? true,
  };

  // ── CTA ───────────────────────────────────────────────────────────────────
  const ctaSec = sec("cta");
  const ctaMeta = (ctaSec?.metadata ?? {}) as {
    badge?: string;
    button1?: { text: string; href: string };
    button2?: { text: string; href: string };
    button3?: { text: string; href: string };
    gradient?: string;
  };
  const cta = {
    badge:    ctaMeta.badge    ?? DEFAULT_CTA.badge,
    title:    ctaSec?.title    ?? DEFAULT_CTA.title,
    subtitle: ctaSec?.subtitle ?? DEFAULT_CTA.subtitle,
    button1:  ctaMeta.button1  ?? DEFAULT_CTA.button1,
    button2:  ctaMeta.button2  ?? DEFAULT_CTA.button2,
    button3:  ctaMeta.button3  ?? DEFAULT_CTA.button3,
    gradient: ctaMeta.gradient ?? DEFAULT_CTA.gradient,
    visible:  ctaSec?.isVisible ?? true,
  };

  return (
    <div>

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      {hero.visible && (
        <section className="bg-slate-900 py-20 px-4 relative overflow-hidden">
          {/* Subtle grid texture */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" aria-hidden="true">
            <defs>
              <pattern id="org-hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M48 0H0v48" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#org-hero-grid)" />
          </svg>
          <div className="relative max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              <IconBuilding />
              For Organisations
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
              {hero.title}
            </h1>
            {hero.subtitle && (
              <div
                className="text-lg text-slate-300 max-w-2xl leading-relaxed mb-8 prose prose-invert prose-lg"
                dangerouslySetInnerHTML={{ __html: hero.subtitle }}
              />
            )}
            <div className="flex flex-wrap gap-3">
              {hero.primaryCta.text && (
                <Link href={hero.primaryCta.href || "#"} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg">
                  {hero.primaryCta.text}
                </Link>
              )}
              {hero.secondaryCta.text && (
                <Link href={hero.secondaryCta.href || "#"} className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                  {hero.secondaryCta.text}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 2. Introduction ─────────────────────────────────────────────── */}
      {intro.visible && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">The Business Case</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-snug">
                  {intro.title}
                </h2>
                {intro.subtitle && (
                  <p className="text-indigo-600 font-medium mb-4 leading-relaxed">{intro.subtitle}</p>
                )}
              </div>
              <div>
                {intro.content && (
                  <div
                    className="text-gray-600 leading-relaxed prose prose-gray"
                    dangerouslySetInnerHTML={{ __html: intro.content }}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. Services List ────────────────────────────────────────────── */}
      {servicesList.visible && (
        <section className="py-24 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">What We Offer</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{servicesList.title}</h2>
              {servicesList.subtitle && (
                <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">{servicesList.subtitle}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesList.items.map((s) => (
                <div key={s.title} className="bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:bg-indigo-200 transition-colors">
                    {getIcon(s.iconName)}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Why Partner With Us ──────────────────────────────────────── */}
      {whyPartner.visible && (
        <section className="py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">Why MindBridge</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{whyPartner.title}</h2>
              {whyPartner.subtitle && (
                <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">{whyPartner.subtitle}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyPartner.items.map((item) => (
                <div key={item.title} className="flex gap-4 p-6 rounded-2xl hover:bg-indigo-50/60 transition-colors group">
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
                    {getIcon(item.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1.5">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. CTA ──────────────────────────────────────────────────────── */}
      {cta.visible && (
        <section className={`py-28 px-4 bg-gradient-to-br ${cta.gradient} relative overflow-hidden`}>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center">
            {cta.badge && (
              <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-7">
                ✦ {cta.badge}
              </div>
            )}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {cta.title.split("\n").map((line, i) => (
                <span key={i}>{line}{i < cta.title.split("\n").length - 1 && <br />}</span>
              ))}
            </h2>
            {cta.subtitle && (
              <div
                className="text-indigo-100 text-lg leading-relaxed mb-10 max-w-xl mx-auto prose prose-invert prose-lg"
                dangerouslySetInnerHTML={{ __html: cta.subtitle }}
              />
            )}
            <div className="flex flex-wrap gap-4 justify-center">
              {cta.button1.text && (
                <Link href={cta.button1.href || "#"} className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                  {cta.button1.text}
                </Link>
              )}
              {cta.button2.text && (
                <Link href={cta.button2.href || "#"} className="px-8 py-4 bg-white/15 text-white font-bold rounded-xl hover:bg-white/25 transition-colors shadow-lg">
                  {cta.button2.text}
                </Link>
              )}
              {cta.button3.text && (
                <Link href={cta.button3.href || "#"} className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                  {cta.button3.text}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
