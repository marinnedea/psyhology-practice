import Link from "next/link";
import { prisma } from "@/lib/db";

// ── Types ────────────────────────────────────────────────────────────────────

type HeroMeta = {
  primaryCta?: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
};

type StatsItem = { value: string; label: string };
type StatsMeta = { items?: StatsItem[] };

type FeatureItem = { icon?: string; image?: string; imageUrl?: string; title: string; description: string; readMoreText?: string; readMoreHref?: string };
type FeaturesMeta = { items?: FeatureItem[] };

type WhyChooseItem = { image: string; title: string; description: string };
type WhyChooseMeta = { items?: WhyChooseItem[] };

type HowItWorksStep = { number: string; title: string; description: string };
type HowItWorksMeta = { steps?: HowItWorksStep[] };

type ServicesPreviewMeta = { count?: number };

type TestimonialItem = { name: string; role: string; quote: string; rating: number };
// selectedIds: DB-driven selection; items: legacy inline format
type TestimonialsMeta = { selectedIds?: string[]; items?: TestimonialItem[] };

type TeamPreviewMeta = { count?: number };
type BlogPreviewMeta = { count?: number };

type CtaBannerMeta = {
  buttonText?: string;
  buttonHref?: string;
  gradient?: string;
};

// ── Defaults ─────────────────────────────────────────────────────────────────

const defaultHeroMeta: HeroMeta = {
  primaryCta: { text: "Find a Psychologist", href: "/psychologists" },
  secondaryCta: { text: "Our Services", href: "/services" },
};

const defaultStatsMeta: StatsMeta = {
  items: [
    { value: "500+", label: "Clients Helped" },
    { value: "15+", label: "Psychologists" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "10+", label: "Years Combined Experience" },
  ],
};

const defaultFeaturesMeta: FeaturesMeta = {
  items: [
    { image: "/uploads/seed/feature-individual.jpg", title: "Individual Therapy", description: "One-on-one sessions tailored to your personal challenges and mental health goals." },
    { image: "/uploads/seed/feature-couples.jpg", title: "Couples Therapy", description: "Strengthen your relationship with guided sessions focused on communication and understanding." },
    { image: "/uploads/seed/feature-family.jpg", title: "Family Support", description: "Improve family dynamics and relationships with collaborative therapeutic approaches." },
    { image: "/uploads/seed/feature-online.jpg", title: "Online Sessions", description: "Access professional mental health care from the comfort of your own space." },
  ],
};

const defaultWhyChooseMeta: WhyChooseMeta = {
  items: [
    { image: "/uploads/seed/why-licensed.jpg", title: "Licensed & Vetted Professionals", description: "Every psychologist on our platform is fully licensed, thoroughly vetted, and continuously evaluated to ensure the highest standard of care." },
    { image: "/uploads/seed/why-personalized.jpg", title: "Truly Personalised Care", description: "We match you with the right specialist for your unique needs, background, and goals — ensuring a genuinely personalised therapeutic journey." },
    { image: "/uploads/seed/why-confidential.jpg", title: "Complete Confidentiality", description: "Your sessions, concerns, and personal information are fully protected under strict professional ethics and data privacy standards." },
    { image: "/uploads/seed/why-flexible.jpg", title: "Flexible Scheduling", description: "Book in-person or online sessions at times that work for your lifestyle, with easy rescheduling whenever life gets in the way." },
  ],
};

const defaultHowItWorksMeta: HowItWorksMeta = {
  steps: [
    { number: "01", title: "Book a Consultation", description: "Browse our directory of qualified psychologists and book a time that works for you — online or in person." },
    { number: "02", title: "Meet Your Psychologist", description: "Your first session is about getting to know each other and discussing what brings you to therapy." },
    { number: "03", title: "Start Your Journey", description: "With a personalised plan in place, work with your psychologist toward lasting positive change." },
  ],
};

const defaultTestimonialsMeta: TestimonialsMeta = {
  items: [
    { name: "Sarah M.", role: "Client since 2023", quote: "Finding the right therapist changed my life. This platform made the whole process so easy and stress-free.", rating: 5 },
    { name: "James K.", role: "Client since 2022", quote: "The booking process is seamless and my psychologist is wonderful. I feel genuinely supported every session.", rating: 5 },
    { name: "Elena R.", role: "Client since 2024", quote: "I finally feel understood. My psychologist is empathetic, professional, and always makes time for my concerns.", rating: 5 },
  ],
};

const defaultCtaBannerMeta: CtaBannerMeta = {
  buttonText: "Create Your Account",
  buttonHref: "/register",
  gradient: "from-indigo-600 to-indigo-800",
};

const defaultServiceCards = [
  { name: "Individual Therapy", description: "One-on-one sessions to address personal challenges and mental health concerns." },
  { name: "Couples Therapy", description: "Sessions designed to help couples improve communication and resolve conflicts." },
  { name: "Family Therapy", description: "Therapy sessions involving family members to improve relationships and dynamics." },
  { name: "Online Consultation", description: "Convenient video sessions from the comfort of your own space." },
];

// ── Helper ────────────────────────────────────────────────────────────────────

function getMeta<T>(raw: unknown, defaults: T): T {
  if (!raw || typeof raw !== "object") return defaults;
  return { ...defaults, ...(raw as Partial<T>) };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // Fetch all homepage sections in one query
  const dbSections = await prisma.pageSection.findMany({
    where: { page: "homepage" },
    orderBy: { sortOrder: "asc" },
  });

  function getSection(key: string) {
    return dbSections.find((s) => s.sectionKey === key);
  }

  function isVisible(key: string): boolean {
    const s = getSection(key);
    if (!s) return true; // show by default if not in DB
    return s.isVisible;
  }

  // Fetch live data for auto-pulled sections
  const [services, psychologists, blogPosts, heroBg] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
    prisma.psychologistProfile.findMany({
      where: { user: { isApproved: true } },
      include: {
        user: { select: { name: true } },
        profileImage: { select: { localPath: true } },
      },
      take: 6,
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        featuredImage: { select: { localPath: true, altText: true } },
      },
      take: 4,
    }),
    prisma.image.findFirst({ where: { localPath: { contains: "hero-homepage" } } }),
  ]);

  // ── Hero ──────────────────────────────────────────────────────────────────
  const heroSection = getSection("hero");
  const heroMeta = getMeta<HeroMeta>(heroSection?.metadata, defaultHeroMeta);
  const heroTitle = heroSection?.title ?? "Your Mental Health Matters";
  const heroSubtitle = heroSection?.subtitle ?? "Connect with qualified psychologists who care about your well-being. Take the first step towards a healthier mind.";
  const primaryCta = heroMeta.primaryCta ?? defaultHeroMeta.primaryCta!;
  const secondaryCta = heroMeta.secondaryCta ?? defaultHeroMeta.secondaryCta!;

  // ── Stats ─────────────────────────────────────────────────────────────────
  const statsSection = getSection("stats");
  const statsMeta = getMeta<StatsMeta>(statsSection?.metadata, defaultStatsMeta);
  const statsItems = statsMeta.items?.length ? statsMeta.items : defaultStatsMeta.items!;

  // ── Why Choose Us ─────────────────────────────────────────────────────────
  const whySection = getSection("why_choose_us");
  const whyMeta = getMeta<WhyChooseMeta>(whySection?.metadata, defaultWhyChooseMeta);
  const whyTitle = whySection?.title ?? "Why Choose Us";
  const whySubtitle = whySection?.subtitle ?? "We combine clinical excellence with genuine care. Here's what makes our platform different.";
  const whyItems = whyMeta.items?.length ? whyMeta.items : defaultWhyChooseMeta.items!;

  // ── Features ──────────────────────────────────────────────────────────────
  const featuresSection = getSection("features");
  const featuresMeta = getMeta<FeaturesMeta>(featuresSection?.metadata, defaultFeaturesMeta);
  const featuresTitle = featuresSection?.title ?? "How We Can Help";
  const featuresSubtitle = featuresSection?.subtitle ?? "Comprehensive mental health support tailored to your unique needs and circumstances.";
  const featureItems = featuresMeta.items?.length ? featuresMeta.items : defaultFeaturesMeta.items!;

  // ── How It Works ──────────────────────────────────────────────────────────
  const howSection = getSection("how_it_works");
  const howMeta = getMeta<HowItWorksMeta>(howSection?.metadata, defaultHowItWorksMeta);
  const howTitle = howSection?.title ?? "How It Works";
  const howSubtitle = howSection?.subtitle ?? "Getting started with professional mental health support is simple and straightforward.";
  const howSteps = howMeta.steps?.length ? howMeta.steps : defaultHowItWorksMeta.steps!;

  // ── Services Preview ──────────────────────────────────────────────────────
  const servicesSection = getSection("services_preview");
  const servicesMeta = getMeta<ServicesPreviewMeta>(servicesSection?.metadata, { count: 6 });
  const servicesTitle = servicesSection?.title ?? "Our Services";
  const servicesSubtitle = servicesSection?.subtitle ?? "Professional care tailored to your needs";
  const servicesCount = servicesMeta.count ?? 6;
  const serviceCards = services.slice(0, servicesCount);

  // ── Testimonials ──────────────────────────────────────────────────────────
  const testiSection = getSection("testimonials");
  const testiMeta = getMeta<TestimonialsMeta>(testiSection?.metadata, {});
  const testiTitle = testiSection?.title ?? "What Our Clients Say";
  const testiSubtitle = testiSection?.subtitle ?? "Real stories from people who have taken the step towards better mental health.";

  let testiItems: TestimonialItem[];
  if (testiMeta.selectedIds && testiMeta.selectedIds.length > 0) {
    // DB-driven: fetch selected testimonials by ID
    const dbTestimonials = await prisma.testimonial.findMany({
      where: { id: { in: testiMeta.selectedIds }, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    // Preserve selection order
    const byId = Object.fromEntries(dbTestimonials.map((t) => [t.id, t]));
    testiItems = testiMeta.selectedIds
      .filter((id) => byId[id])
      .map((id) => ({
        name: byId[id].clientName,
        role: byId[id].clientRole ?? "",
        quote: byId[id].quote,
        rating: byId[id].rating,
      }));
  } else if (testiMeta.items?.length) {
    // Legacy inline items
    testiItems = testiMeta.items;
  } else {
    // Absolute default
    testiItems = defaultTestimonialsMeta.items!;
  }

  // ── Team Preview ──────────────────────────────────────────────────────────
  const teamSection = getSection("team_preview");
  const teamMeta = getMeta<TeamPreviewMeta>(teamSection?.metadata, { count: 6 });
  const teamTitle = teamSection?.title ?? "Meet Our Psychologists";
  const teamSubtitle = teamSection?.subtitle ?? "Our team of qualified, experienced professionals are dedicated to your well-being.";
  const teamCount = teamMeta.count ?? 6;
  const teamProfiles = psychologists.slice(0, teamCount);

  // ── Blog Preview ──────────────────────────────────────────────────────────
  const blogSection = getSection("blog_preview");
  const blogMeta = getMeta<BlogPreviewMeta>(blogSection?.metadata, { count: 3 });
  const blogTitle = blogSection?.title ?? "From Our Blog";
  const blogSubtitle = blogSection?.subtitle ?? "Insights, guides, and expert perspectives on mental health and well-being.";
  const blogCount = blogMeta.count ?? 3;
  // +1 so count controls the grid size; blogItems[0] is the featured card
  const blogItems = blogPosts.slice(0, blogCount + 1);

  // ── CTA Banner ────────────────────────────────────────────────────────────
  const ctaSection = getSection("cta_banner");
  const ctaMeta = getMeta<CtaBannerMeta>(ctaSection?.metadata, defaultCtaBannerMeta);
  const ctaTitle = ctaSection?.title ?? "Ready to Start Your Journey?";
  const ctaSubtitle = ctaSection?.subtitle ?? "Join thousands of people who have taken the step towards better mental health.";
  const ctaButtonText = ctaMeta.buttonText ?? defaultCtaBannerMeta.buttonText!;
  const ctaButtonHref = ctaMeta.buttonHref ?? defaultCtaBannerMeta.buttonHref!;
  const ctaGradient = ctaMeta.gradient ?? defaultCtaBannerMeta.gradient!;

  return (
    <div>
      {/* ── Hero ── */}
      {isVisible("hero") && (
        <section
          className="relative min-h-[88vh] flex items-center overflow-hidden bg-indigo-950"
          style={heroBg ? {
            backgroundImage: `url(${heroBg.localPath})`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          } : {}}
        >
          {/* Dark overlay — always rendered so text is readable even while image loads */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/92 via-indigo-900/75 to-indigo-800/30" />

          {/* Decorative rings */}
          <div className="absolute right-[-8%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 pointer-events-none hidden lg:block" />
          <div className="absolute right-[2%] top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5 pointer-events-none hidden lg:block" />
          <div className="absolute right-[12%] top-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-white/8 pointer-events-none hidden lg:block" />

          <div className="relative max-w-5xl mx-auto px-6 py-28 w-full">
            <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-5">
              Professional Mental Health Care
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-3xl">
              {heroTitle}
            </h1>
            <p className="text-lg text-indigo-100/90 max-w-2xl leading-relaxed mb-10">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={primaryCta.href}
                className="px-7 py-3.5 bg-white text-indigo-800 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
              >
                {primaryCta.text}
              </Link>
              <Link
                href={secondaryCta.href}
                className="px-7 py-3.5 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors shadow-lg"
              >
                {secondaryCta.text}
              </Link>
              <Link
                href="/contact"
                className="px-7 py-3.5 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Stats Bar ── */}
      {isVisible("stats") && (
        <section className="bg-gray-50 border-y border-gray-200 py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsItems.map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">{item.value}</p>
                  <p className="text-sm text-gray-500 mt-1 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Choose Us ── */}
      {isVisible("why_choose_us") && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{whyTitle}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{whySubtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyItems.map((item) => (
                <div key={item.title} className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow bg-white">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How We Can Help (Features) ── */}
      {isVisible("features") && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{featuresTitle}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{featuresSubtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featureItems.map((item) => {
                const imgSrc = item.imageUrl || item.image;
                const hasReadMore = item.readMoreText && item.readMoreHref;
                return (
                  <div key={item.title} className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow bg-white flex flex-col">
                    {imgSrc ? (
                      <div className="h-40 overflow-hidden shrink-0">
                        <img
                          src={imgSrc}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : item.icon ? (
                      <div className="h-40 bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center shrink-0">
                        <span className="text-5xl">{item.icon}</span>
                      </div>
                    ) : null}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                      <div
                        className="text-gray-600 text-sm leading-relaxed flex-1 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                      {hasReadMore && (
                        <Link
                          href={item.readMoreHref!}
                          className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          {item.readMoreText}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      {isVisible("how_it_works") && (
        <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-indigo-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{howTitle}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{howSubtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {howSteps.map((step, idx) => (
                <div key={step.number} className="relative">
                  {idx < howSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-indigo-200 z-0 -translate-x-1/2" />
                  )}
                  <div className="relative z-10 bg-white rounded-2xl p-6 shadow-sm border border-indigo-100">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                      {step.number}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{step.title}</h3>
                    <div className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: step.description }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Services Preview ── */}
      {isVisible("services_preview") && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{servicesTitle}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{servicesSubtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(serviceCards.length > 0 ? serviceCards : defaultServiceCards).map((svc) => (
                <div
                  key={svc.name}
                  className="p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{svc.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{svc.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/services"
                className="inline-block bg-indigo-600 text-white px-7 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
              >
                View All Services
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {isVisible("testimonials") && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{testiTitle}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{testiSubtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testiItems.map((item) => (
                <div key={item.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">&ldquo;{item.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Meet Our Team ── */}
      {isVisible("team_preview") && teamProfiles.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{teamTitle}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{teamSubtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamProfiles.map((profile) => (
                <div key={profile.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center mb-4">
                    {profile.profileImage ? (
                      <img src={profile.profileImage.localPath} alt={profile.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-indigo-700 font-bold text-xl">
                        {profile.user.name?.charAt(0) ?? "P"}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{profile.user.name}</h3>
                  {profile.location && (
                    <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </p>
                  )}
                  {profile.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {profile.specialties.slice(0, 2).map((spec) => (
                        <span key={spec} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/psychologists/${profile.id}`}
                    className="text-indigo-600 text-sm font-medium hover:underline"
                  >
                    View Profile &rarr;
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/psychologists"
                className="inline-block border border-indigo-600 text-indigo-600 px-7 py-3 rounded-xl hover:bg-indigo-50 transition-colors font-semibold"
              >
                Meet All Psychologists
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── From Our Blog ── */}
      {isVisible("blog_preview") && blogItems.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{blogTitle}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{blogSubtitle}</p>
            </div>

            {/* Featured post — wide 2-column card */}
            {blogItems[0] && (() => {
              const featured = blogItems[0];
              return (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group flex flex-col md:flex-row rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow bg-white mb-8"
                >
                  {/* Image */}
                  <div className="md:w-1/2 h-64 md:h-auto overflow-hidden bg-gradient-to-br from-indigo-100 to-indigo-200 shrink-0">
                    {featured.featuredImage ? (
                      <img
                        src={featured.featuredImage.localPath}
                        alt={featured.featuredImage.altText ?? featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex flex-col justify-center p-8 md:p-12 md:w-1/2">
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">
                      Latest Article
                    </p>
                    {featured.category && (
                      <span className="inline-block text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
                        {featured.category.name}
                      </span>
                    )}
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-4 group-hover:text-indigo-700 transition-colors">
                      {featured.title}
                    </h3>
                    {featured.excerpt && (
                      <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">
                        {featured.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                          {featured.author.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{featured.author.name}</p>
                          {featured.publishedAt && (
                            <p className="text-xs text-gray-400">
                              {new Date(featured.publishedAt).toLocaleDateString("en-GB", {
                                day: "numeric", month: "long", year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:gap-3 transition-all">
                        Read article
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* Remaining posts grid */}
            {blogItems.slice(1).length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                {blogItems.slice(1).map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                    <div className="h-44 overflow-hidden">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage.localPath}
                          alt={post.featuredImage.altText ?? post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
                          <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      {post.category && (
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                          {post.category.name}
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                        <span>{post.author.name}</span>
                        {post.publishedAt && (
                          <span>{new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-10">
              <Link
                href="/blog"
                className="inline-block border border-indigo-600 text-indigo-600 px-7 py-3 rounded-xl hover:bg-indigo-50 transition-colors font-semibold"
              >
                Read All Articles
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ── */}
      {isVisible("cta_banner") && (
        <section className={`py-20 px-4 bg-gradient-to-r ${ctaGradient}`}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{ctaTitle}</h2>
            <p className="text-indigo-100 text-lg mb-8 leading-relaxed">{ctaSubtitle}</p>
            <Link
              href={ctaButtonHref}
              className="inline-block bg-white text-indigo-700 px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-sm"
            >
              {ctaButtonText}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
