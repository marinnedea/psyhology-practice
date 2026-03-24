import { prisma } from "@/lib/db";
import Link from "next/link";

export const metadata = {
  title: "Services | MindBridge",
  description:
    "Professional psychological services for individuals, families, and organisations. Your mental and physical equilibrium, restored and sustained.",
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

// ── Default section data (used when DB has no rows) ────────────────────────────

const DEFAULT_HERO = {
  title: "Services for Your Wellbeing — Mind & Body in Balance",
  subtitle: "Your mental and physical equilibrium is not a destination — it is a practice. Qualified psychologists, evidence-based approaches, lasting change.",
  primaryCta: { text: "Find a Psychologist", href: "/psychologists" },
  secondaryCta: { text: "Contact Us", href: "/contact" },
};

const DEFAULT_MOTTO = {
  quote: "The greatest wealth is health — and the first step toward change is the courage to seek help.",
  attribution: "MindBridge Philosophy",
};

const DEFAULT_HOW_IT_WORKS = {
  title: "How We Work",
  subtitle: "Getting started is simpler than you think. We guide you every step of the way.",
  steps: [
    { number: "01", title: "Book a Consultation", description: "Choose a psychologist and pick a time that suits you. Online or in-person — your choice." },
    { number: "02", title: "Meet Your Specialist", description: "In your first session you discuss your situation openly. We listen without judgement." },
    { number: "03", title: "Agree a Plan", description: "Together we create a personalised plan with clear goals and a realistic timeline." },
    { number: "04", title: "Progress Together", description: "Regular sessions, continuous feedback, and adjustments along the way — you are never alone." },
  ],
};

const DEFAULT_WHY_US = {
  title: "What Sets Us Apart",
  subtitle: "We believe access to quality mental health care should be straightforward, compassionate, and effective.",
  items: [
    { iconName: "shield",  title: "Qualified & Vetted",       description: "All our psychologists hold recognised professional qualifications and undergo rigorous vetting before joining." },
    { iconName: "heart",   title: "Person-Centred Care",      description: "Every care plan is built around you — your needs, your pace, and your goals." },
    { iconName: "star",    title: "Evidence-Based Practice",  description: "We use only approaches with strong clinical evidence: CBT, EMDR, ACT, Schema Therapy, and more." },
    { iconName: "users",   title: "Multi-Disciplinary Team",  description: "From individual therapy to couples, family, and workplace — our broad team covers the full spectrum." },
    { iconName: "bolt",    title: "Flexible & Accessible",    description: "In-person and online sessions, daytime and evening availability — mental health support that fits your life." },
    { iconName: "chart",   title: "Measurable Progress",      description: "We track outcomes at every stage so you can see the difference and stay motivated on your journey." },
  ],
};

const DEFAULT_FOR_COMPANIES = {
  title: "Investing in Your People's Mental Health",
  subtitle: "Organisations that prioritise psychological wellbeing see measurable improvements in retention, productivity, and culture. We offer a suite of tailored services designed for teams of all sizes.",
  ctaText: "Request a Proposal",
  ctaHref: "/contact",
  items: [
    { iconName: "chart",     title: "Workplace Psychological Assessment",  description: "Structured evaluations of individual and team wellbeing, identifying risk factors, burnout indicators, and opportunities for organisational growth." },
    { iconName: "heart",     title: "Employee Psychotherapy",              description: "Confidential one-on-one therapy sessions for staff, available as part of an Employee Assistance Programme (EAP) or direct referral scheme." },
    { iconName: "users",     title: "Resilience & Wellbeing Workshops",    description: "Interactive group sessions covering stress management, emotional regulation, communication skills, and burnout prevention — led by our clinical team." },
    { iconName: "lightbulb", title: "Team Building with Specialists",      description: "Purposeful team experiences built around psychological safety, trust, and healthy communication — facilitated by our psychologists, not event coordinators." },
    { iconName: "star",      title: "Leadership & Executive Coaching",     description: "Individual coaching for managers and senior leaders on emotional intelligence, decision-making under pressure, and sustainable high performance." },
    { iconName: "lifebuoy",  title: "Crisis & Critical Incident Support",  description: "Rapid-response psychological support for teams following traumatic events, major organisational change, or acute workplace stress situations." },
  ],
  trustHighlights: [
    { label: "Tailored programmes",     description: "No off-the-shelf packages — every engagement is scoped to your organisation's specific context and goals." },
    { label: "Qualified clinical team", description: "All facilitators and coaches are chartered psychologists or accredited therapists with workplace experience." },
    { label: "Measurable outcomes",     description: "Pre and post assessments, anonymised reporting, and actionable recommendations delivered after every programme." },
  ],
};

const DEFAULT_CTA = {
  badge: "Take the First Step",
  title: "The First Step Is\nthe Most Important One",
  subtitle: "You don't need to have it all figured out. Simply reach out — our team will help you find the right specialist and the right path forward.",
  button1: { text: "Schedule a Meeting",    href: "/psychologists" },
  button2: { text: "Find a Psychologist",   href: "/psychologists" },
  button3: { text: "Contact Us",            href: "/contact" },
  gradient: "from-indigo-600 to-indigo-800",
};

const SERVICE_ICONS = [<IconHeart key="h" />, <IconUsers key="u" />, <IconShield key="s" />, <IconBolt key="b" />, <IconStar key="st" />, <IconChart key="c" />];
const SERVICE_COLORS = ["indigo", "violet", "purple", "blue", "rose", "amber"];

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ServicesPage() {
  const [services, rawSections] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.pageSection.findMany({
      where: { page: "services" },
    }),
  ]);

  // Helper: find a section by key
  function sec(key: string) {
    return rawSections.find((s) => s.sectionKey === key);
  }

  // ── Hero ────────────────────────────────────────────────────────────────────
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

  // ── Motto ────────────────────────────────────────────────────────────────────
  const mottoSec = sec("motto");
  const mottoMeta = (mottoSec?.metadata ?? {}) as { quote?: string; attribution?: string };
  const motto = {
    quote:       mottoMeta.quote       ?? DEFAULT_MOTTO.quote,
    attribution: mottoMeta.attribution ?? DEFAULT_MOTTO.attribution,
    visible:     mottoSec?.isVisible   ?? true,
  };

  // ── How It Works ─────────────────────────────────────────────────────────────
  const howSec = sec("how_it_works");
  const howMeta = (howSec?.metadata ?? {}) as { steps?: { number: string; title: string; description: string }[] };
  const how = {
    title:   howSec?.title    ?? DEFAULT_HOW_IT_WORKS.title,
    subtitle: howSec?.subtitle ?? DEFAULT_HOW_IT_WORKS.subtitle,
    steps:   howMeta.steps   ?? DEFAULT_HOW_IT_WORKS.steps,
    visible: howSec?.isVisible ?? true,
  };

  // ── Why Us ───────────────────────────────────────────────────────────────────
  const whySec = sec("why_us");
  const whyMeta = (whySec?.metadata ?? {}) as { items?: { iconName: string; title: string; description: string }[] };
  const why = {
    title:   whySec?.title    ?? DEFAULT_WHY_US.title,
    subtitle: whySec?.subtitle ?? DEFAULT_WHY_US.subtitle,
    items:   whyMeta.items   ?? DEFAULT_WHY_US.items,
    visible: whySec?.isVisible ?? true,
  };

  // ── For Companies ─────────────────────────────────────────────────────────────
  const corpSec = sec("for_companies");
  const corpMeta = (corpSec?.metadata ?? {}) as {
    items?: { iconName: string; title: string; description: string }[];
    trustHighlights?: { label: string; description: string }[];
    ctaText?: string;
    ctaHref?: string;
  };
  const corp = {
    title:           corpSec?.title           ?? DEFAULT_FOR_COMPANIES.title,
    subtitle:        corpSec?.subtitle        ?? DEFAULT_FOR_COMPANIES.subtitle,
    items:           corpMeta.items           ?? DEFAULT_FOR_COMPANIES.items,
    trustHighlights: corpMeta.trustHighlights ?? DEFAULT_FOR_COMPANIES.trustHighlights,
    ctaText:         corpMeta.ctaText         ?? DEFAULT_FOR_COMPANIES.ctaText,
    ctaHref:         corpMeta.ctaHref         ?? DEFAULT_FOR_COMPANIES.ctaHref,
    visible:         corpSec?.isVisible       ?? true,
  };

  // ── CTA ───────────────────────────────────────────────────────────────────────
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

  // ── Services ──────────────────────────────────────────────────────────────────
  const fallbackServices = [
    { id: "f1", name: "Individual Therapy",      description: "One-on-one sessions focused on personal growth, anxiety, depression, trauma, and more.", price: "80",  duration: 50 },
    { id: "f2", name: "Couples Therapy",         description: "Strengthen communication, rebuild trust, and navigate challenges together with your partner.", price: "100", duration: 60 },
    { id: "f3", name: "Family Therapy",          description: "Improve family dynamics, resolve conflicts, and foster healthier relationships at home.", price: "120", duration: 60 },
    { id: "f4", name: "Child & Adolescent",      description: "Specialised support for children and teenagers facing emotional or behavioural difficulties.", price: "80",  duration: 50 },
    { id: "f5", name: "Online Consultation",     description: "Receive quality psychological support from the comfort of your own home via video call.", price: "70",  duration: 50 },
    { id: "f6", name: "Psychological Assessment",description: "Comprehensive evaluations for cognitive, emotional, and behavioural concerns.", price: "150", duration: 90 },
  ];

  const displayServices = services.length > 0
    ? services.map((s) => ({ id: s.id, name: s.name, description: s.description ?? "", price: Number(s.price).toFixed(0), duration: s.duration, isHtml: true }))
    : fallbackServices.map((s) => ({ ...s, isHtml: false }));

  return (
    <div>

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      {hero.visible && (
        <section className="bg-gradient-to-br from-slate-50 to-indigo-50 py-16 px-4 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">
              MindBridge Psychology
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {hero.title}
            </h1>
            {hero.subtitle && (
              <div
                className="text-lg text-gray-600 max-w-2xl leading-relaxed mb-7 prose prose-gray prose-lg"
                dangerouslySetInnerHTML={{ __html: hero.subtitle }}
              />
            )}
            <div className="flex flex-wrap gap-3">
              {hero.primaryCta.text && (
                <Link href={hero.primaryCta.href || "#"} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                  {hero.primaryCta.text}
                </Link>
              )}
              {hero.secondaryCta.text && (
                <Link href={hero.secondaryCta.href || "#"} className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors">
                  {hero.secondaryCta.text}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 2. Motto strip ──────────────────────────────────────────────── */}
      {motto.visible && (
        <section className="bg-indigo-950 py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <svg className="w-8 h-8 text-indigo-500 mx-auto mb-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote className="text-xl md:text-2xl text-white font-light italic leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: motto.quote }} />
            </blockquote>
            {motto.attribution && (
              <p className="text-indigo-500 text-sm mt-5 font-medium tracking-wide">— {motto.attribution}</p>
            )}
          </div>
        </section>
      )}

      {/* ── 3. Our Services ─────────────────────────────────────────────── */}
      <section id="services" className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">What We Offer</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
              Professional, evidence-based psychological care tailored to every stage of life
              and every kind of challenge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service, i) => {
              const col = SERVICE_COLORS[i % SERVICE_COLORS.length];
              return (
                <div key={service.id} className="group rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col bg-white">
                  <div className={`w-12 h-12 rounded-xl bg-${col}-50 text-${col}-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    {SERVICE_ICONS[i % SERVICE_ICONS.length]}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{service.name}</h3>
                  {service.isHtml ? (
                    <div
                      className="text-gray-500 text-sm leading-relaxed flex-1 mb-6 prose prose-sm prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: service.description }}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-6">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div>
                      <span className="text-2xl font-bold text-indigo-600">€{service.price}</span>
                      <span className="text-gray-400 text-sm ml-1">/ session</span>
                    </div>
                    <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full font-medium">{service.duration} min</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. How We Work ──────────────────────────────────────────────── */}
      {how.visible && (
        <section className="py-24 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">The Process</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{how.title}</h2>
              {how.subtitle && (
                <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">{how.subtitle}</p>
              )}
            </div>

            <div className="relative">
              {/* Connector line — desktop only */}
              <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-indigo-100" />
              <div className={`grid md:grid-cols-${Math.min(how.steps.length, 4)} gap-10`}>
                {how.steps.map((item) => (
                  <div key={item.number} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-indigo-100 shadow-sm flex items-center justify-center mb-5 relative z-10">
                      <span className="text-xl font-bold text-indigo-400">{item.number}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                    <div
                      className="text-gray-500 text-sm leading-relaxed prose prose-sm prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Why Choose Us ────────────────────────────────────────────── */}
      {why.visible && (
        <section className="py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">Why MindBridge</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{why.title}</h2>
              {why.subtitle && (
                <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">{why.subtitle}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {why.items.map((item) => (
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

      {/* ── 6. For Companies ────────────────────────────────────────────── */}
      {corp.visible && (
        <section className="py-24 px-4 bg-slate-900 relative overflow-hidden">
          {/* Subtle grid texture */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" aria-hidden="true">
            <defs>
              <pattern id="corp-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M48 0H0v48" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#corp-grid)" />
          </svg>

          <div className="relative max-w-5xl mx-auto">
            {/* Section header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
              <div>
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                  <IconBuilding />
                  For Organisations
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-xl leading-snug">
                  {corp.title}
                </h2>
                {corp.subtitle && (
                  <p className="text-slate-400 max-w-lg leading-relaxed">{corp.subtitle}</p>
                )}
              </div>
              {corp.ctaText && (
                <div className="shrink-0">
                  <Link href={corp.ctaHref || "#"} className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors whitespace-nowrap shadow-lg">
                    {corp.ctaText}
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Service cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {corp.items.map((s) => (
                <div key={s.title} className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-colors group">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-5 group-hover:bg-indigo-500/30 transition-colors">
                    {getIcon(s.iconName)}
                  </div>
                  <h3 className="font-bold text-white mb-3">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>

            {/* Trust highlights */}
            {corp.trustHighlights.length > 0 && (
              <div className="pt-10 border-t border-white/10 grid sm:grid-cols-3 gap-6">
                {corp.trustHighlights.map((h) => (
                  <div key={h.label} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <IconCheck />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">{h.label}</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{h.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 7. First Step CTA ────────────────────────────────────────────── */}
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
