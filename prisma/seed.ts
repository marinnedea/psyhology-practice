import "dotenv/config";
import { PrismaClient, BlogPostStatus, AppointmentStatus } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Helper: find or create an Image record by localPath
async function findOrCreateImage(localPath: string, altText: string): Promise<string> {
  const existing = await prisma.image.findFirst({ where: { localPath } });
  if (existing) return existing.id;
  const img = await prisma.image.create({ data: { localPath, altText } });
  return img.id;
}

async function main() {
  // ── Images ─────────────────────────────────────────────────────────────
  const imgHero = await findOrCreateImage("/uploads/seed/hero-therapy.jpg", "Therapy session");
  const imgFeatInd = await findOrCreateImage("/uploads/seed/feature-individual.jpg", "Individual therapy");
  const imgFeatCouples = await findOrCreateImage("/uploads/seed/feature-couples.jpg", "Couples therapy");
  const imgFeatFamily = await findOrCreateImage("/uploads/seed/feature-family.jpg", "Family therapy");
  const imgFeatOnline = await findOrCreateImage("/uploads/seed/feature-online.jpg", "Online therapy");
  const imgWhyLicensed = await findOrCreateImage("/uploads/seed/why-licensed.jpg", "Licensed professionals");
  const imgWhyConf = await findOrCreateImage("/uploads/seed/why-confidential.jpg", "Confidential sessions");
  const imgWhyPersonal = await findOrCreateImage("/uploads/seed/why-personalized.jpg", "Personalized approach");
  const imgWhyFlex = await findOrCreateImage("/uploads/seed/why-flexible.jpg", "Flexible scheduling");
  const imgAboutStory = await findOrCreateImage("/uploads/seed/about-story.jpg", "Our story");
  const imgAboutMission = await findOrCreateImage("/uploads/seed/about-mission.jpg", "Our mission");
  const imgAboutValues = await findOrCreateImage("/uploads/seed/about-values.jpg", "Our values");
  const imgPsychSofia = await findOrCreateImage("/uploads/seed/psych-sofia.jpg", "Dr. Sofia Andreou");
  const imgPsychMarco = await findOrCreateImage("/uploads/seed/psych-marco.jpg", "Dr. Marco Ferreira");
  const imgPsychAna = await findOrCreateImage("/uploads/seed/psych-ana.jpg", "Dr. Ana Silva");
  const imgPsychElena = await findOrCreateImage("/uploads/seed/psych-elena.jpg", "Dr. Elena Vasquez");
  const imgPsychDavid = await findOrCreateImage("/uploads/seed/psych-david.jpg", "Dr. David Chen");
  const imgPsychMaria = await findOrCreateImage("/uploads/seed/psych-maria.jpg", "Dr. Maria Santos");
  const imgPsychJames = await findOrCreateImage("/uploads/seed/psych-james.jpg", "Dr. James Mitchell");
  const imgPsychSarah = await findOrCreateImage("/uploads/seed/psych-sarah.jpg", "Dr. Sarah Thompson");
  const imgPsychThomas = await findOrCreateImage("/uploads/seed/psych-thomas.jpg", "Dr. Thomas Weber");
  const imgPsychAmira = await findOrCreateImage("/uploads/seed/psych-amira.jpg", "Dr. Amira Hassan");
  const imgPsychCarlos = await findOrCreateImage("/uploads/seed/psych-carlos.jpg", "Dr. Carlos Mendes");
  const imgPsychLisa = await findOrCreateImage("/uploads/seed/psych-lisa.jpg", "Dr. Lisa Park");
  const imgPsychMichael = await findOrCreateImage("/uploads/seed/psych-michael.jpg", "Dr. Michael Brown");
  const imgBlogAnxiety = await findOrCreateImage("/uploads/seed/blog-anxiety.jpg", "Understanding anxiety");
  const imgBlogBurnout = await findOrCreateImage("/uploads/seed/blog-burnout.jpg", "Burnout vs stress");
  const imgBlogParenting = await findOrCreateImage("/uploads/seed/blog-parenting.jpg", "Parenting and anxiety");
  const imgBlogSelfcare = await findOrCreateImage("/uploads/seed/blog-selfcare.jpg", "Self-compassion");
  const imgBlogMindfulness = await findOrCreateImage("/uploads/seed/blog-mindfulness.jpg", "Mindfulness techniques");
  const imgBlogRelationships = await findOrCreateImage("/uploads/seed/blog-relationships.jpg", "Healthy relationships");
  const imgBlogSleep = await findOrCreateImage("/uploads/seed/blog-sleep.jpg", "Sleep and mental health");
  const imgBlogExercise = await findOrCreateImage("/uploads/seed/blog-exercise.jpg", "Exercise and wellness");
  const imgBlogGoals = await findOrCreateImage("/uploads/seed/blog-goals.jpg", "Setting goals");
  const imgBlogWorkplace = await findOrCreateImage("/uploads/seed/blog-workplace.jpg", "Workplace stress");
  const imgBlogGrief = await findOrCreateImage("/uploads/seed/blog-grief.jpg", "Grief and loss");
  const imgBlogSocial = await findOrCreateImage("/uploads/seed/blog-social.jpg", "Social connection");
  const imgBlogMeditation = await findOrCreateImage("/uploads/seed/blog-meditation.jpg", "Meditation beginners");
  const imgBlogResilience = await findOrCreateImage("/uploads/seed/blog-resilience.jpg", "Building resilience");
  const imgBlogBoundaries = await findOrCreateImage("/uploads/seed/blog-boundaries.jpg", "Setting boundaries");
  console.log("✓ Images");

  // ── Admin ──────────────────────────────────────────────────────────────
  const adminPassword = await hash("Admin123#", 12);
  await prisma.user.upsert({
    where: { email: "admin@psychpractice.com" },
    update: {},
    create: { email: "admin@psychpractice.com", name: "Admin", passwordHash: adminPassword, role: "ADMIN", isApproved: true },
  });
  console.log("✓ Admin");

  // ── Blog categories ────────────────────────────────────────────────────
  const categoryData = [
    { name: "Anxiety", slug: "anxiety" },
    { name: "Stress Management", slug: "stress-management" },
    { name: "Parenting", slug: "parenting" },
    { name: "Self-Care", slug: "self-care" },
    { name: "Mindfulness", slug: "mindfulness" },
    { name: "Relationships", slug: "relationships" },
    { name: "Sleep & Rest", slug: "sleep-rest" },
    { name: "Workplace Wellness", slug: "workplace-wellness" },
    { name: "Grief & Loss", slug: "grief-loss" },
    { name: "Personal Growth", slug: "personal-growth" },
  ];
  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const c = await prisma.blogCategory.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
    categories[cat.slug] = c.id;
  }
  console.log("✓ Blog categories (10)");

  // ── Services ───────────────────────────────────────────────────────────
  const serviceData = [
    { name: "Individual Therapy", description: "One-on-one sessions to address personal challenges and mental health concerns.", price: 80, duration: 50, sortOrder: 1 },
    { name: "Couples Therapy", description: "Sessions designed to help couples improve communication and resolve conflicts.", price: 120, duration: 60, sortOrder: 2 },
    { name: "Family Therapy", description: "Therapy sessions involving family members to improve relationships and dynamics.", price: 140, duration: 75, sortOrder: 3 },
    { name: "Online Consultation", description: "Convenient video sessions from the comfort of your own space.", price: 70, duration: 50, sortOrder: 4 },
    { name: "Child & Adolescent Therapy", description: "Specialised support for children and teenagers facing emotional or behavioural difficulties.", price: 85, duration: 50, sortOrder: 5 },
    { name: "Psychological Assessment", description: "Comprehensive evaluations for cognitive, emotional, and behavioural concerns.", price: 150, duration: 90, sortOrder: 6 },
  ];
  const services: Record<string, string> = {};
  for (const svc of serviceData) {
    let existing = await prisma.service.findFirst({ where: { name: svc.name } });
    if (!existing) existing = await prisma.service.create({ data: svc });
    services[svc.name] = existing.id;
  }
  console.log("✓ Services");

  // ── Page sections: Homepage ────────────────────────────────────────────
  const homepageSections = [
    {
      page: "homepage", sectionKey: "hero", sortOrder: 1, isVisible: true,
      title: "Your Mental Health Matters",
      subtitle: "Connect with qualified psychologists who care about your well-being. Take the first step towards a healthier mind.",
      metadata: {
        badge: "PROFESSIONAL MENTAL HEALTH CARE",
        primaryCta: { text: "Find a Psychologist", href: "/psychologists" },
        secondaryCta: { text: "Our Services", href: "/services" },
        image: "/uploads/seed/hero-therapy.jpg",
      },
    },
    {
      page: "homepage", sectionKey: "stats", sortOrder: 2, isVisible: true,
      title: null, subtitle: null,
      metadata: {
        items: [
          { value: "1,200+", label: "Happy Clients" },
          { value: "15,000+", label: "Sessions Completed" },
          { value: "13", label: "Expert Psychologists" },
          { value: "98%", label: "Client Satisfaction" },
        ],
      },
    },
    {
      page: "homepage", sectionKey: "why_choose_us", sortOrder: 3, isVisible: true,
      title: "Why Choose MindBridge",
      subtitle: "What sets our practice apart from the rest",
      metadata: {
        items: [
          { image: "/uploads/seed/why-licensed.jpg", title: "Licensed Professionals", description: "All our psychologists hold doctoral-level degrees and maintain active licences with their professional bodies." },
          { image: "/uploads/seed/why-confidential.jpg", title: "Confidential & Safe", description: "Your privacy is our priority. All sessions are conducted in secure, HIPAA-compliant settings — in person or online." },
          { image: "/uploads/seed/why-personalized.jpg", title: "Personalised Approach", description: "Every treatment plan is tailored to your unique needs and evolves alongside your progress." },
          { image: "/uploads/seed/why-flexible.jpg", title: "Flexible Scheduling", description: "Morning, evening, and weekend appointments available, plus telehealth options to fit your lifestyle." },
        ],
      },
    },
    {
      page: "homepage", sectionKey: "features", sortOrder: 4, isVisible: true,
      title: "How We Can Help",
      subtitle: "Comprehensive mental health support tailored to your unique needs and circumstances.",
      metadata: {
        items: [
          { image: "/uploads/seed/feature-individual.jpg", title: "Individual Therapy", description: "One-on-one sessions tailored to your personal challenges and mental health goals." },
          { image: "/uploads/seed/feature-couples.jpg", title: "Couples Therapy", description: "Strengthen your relationship with guided sessions focused on communication and understanding." },
          { image: "/uploads/seed/feature-family.jpg", title: "Family Support", description: "Improve family dynamics and relationships with collaborative therapeutic approaches." },
          { image: "/uploads/seed/feature-online.jpg", title: "Online Sessions", description: "Access professional mental health care from the comfort of your own space." },
        ],
      },
    },
    {
      page: "homepage", sectionKey: "how_it_works", sortOrder: 5, isVisible: true,
      title: "How It Works",
      subtitle: "Getting started with professional mental health support is simple and straightforward.",
      metadata: {
        steps: [
          { number: "01", title: "Book a Consultation", description: "Browse our directory of qualified psychologists and book a time that works for you — online or in person." },
          { number: "02", title: "Meet Your Psychologist", description: "Your first session is about getting to know each other and discussing what brings you to therapy." },
          { number: "03", title: "Start Your Journey", description: "With a personalised plan in place, work with your psychologist toward lasting positive change." },
        ],
      },
    },
    {
      page: "homepage", sectionKey: "services_preview", sortOrder: 6, isVisible: true,
      title: "Our Services",
      subtitle: "Professional care tailored to your needs",
      metadata: { count: 6 },
    },
    {
      page: "homepage", sectionKey: "testimonials", sortOrder: 7, isVisible: true,
      title: "What Our Clients Say",
      subtitle: "Real stories from people who have taken the step towards better mental health.",
      metadata: {
        items: [
          { name: "Sarah M.", role: "Client since 2023", quote: "Finding the right therapist changed my life. This platform made the whole process so easy and stress-free.", rating: 5 },
          { name: "James K.", role: "Client since 2022", quote: "The booking process is seamless and my psychologist is wonderful. I feel genuinely supported every session.", rating: 5 },
          { name: "Elena R.", role: "Client since 2024", quote: "I finally feel understood. My psychologist is empathetic, professional, and always makes time for my concerns.", rating: 5 },
        ],
      },
    },
    {
      page: "homepage", sectionKey: "team_preview", sortOrder: 8, isVisible: true,
      title: "Meet Our Psychologists",
      subtitle: "Our team of qualified, experienced professionals are dedicated to your well-being.",
      metadata: { count: 6 },
    },
    {
      page: "homepage", sectionKey: "blog_preview", sortOrder: 9, isVisible: true,
      title: "From Our Blog",
      subtitle: "Insights, guides, and expert perspectives on mental health and well-being.",
      metadata: { count: 3 },
    },
    {
      page: "homepage", sectionKey: "cta_banner", sortOrder: 10, isVisible: true,
      title: "Ready to Start Your Journey?",
      subtitle: "Join thousands of people who have taken the step towards better mental health.",
      metadata: { buttonText: "Create Your Account", buttonHref: "/register", gradient: "from-teal-600 to-blue-700" },
    },
  ];
  for (const s of homepageSections) {
    await prisma.pageSection.upsert({
      where: { page_sectionKey: { page: s.page, sectionKey: s.sectionKey } },
      update: { title: s.title, subtitle: s.subtitle, sortOrder: s.sortOrder, metadata: s.metadata as any },
      create: s as any,
    });
  }
  console.log("✓ Homepage sections (10 incl. why_choose_us)");

  // ── Page sections: About ───────────────────────────────────────────────
  const aboutSections = [
    {
      page: "about", sectionKey: "hero", sortOrder: 0, isVisible: true,
      title: "About MindBridge",
      subtitle: null,
      content: "We believe that mental health care should be accessible, compassionate, and professional. Our platform connects people with qualified psychologists who genuinely care.",
    },
    {
      page: "about", sectionKey: "our_story", sortOrder: 10, isVisible: true,
      title: "Our Story",
      subtitle: "How MindBridge began",
      content: "MindBridge was founded in 2018 by a team of psychologists and technologists who saw first-hand how difficult it was for people to find the right mental health support. Long waiting lists, geographic barriers, and the stigma around seeking help were leaving too many people without care. We set out to change that — by building a platform that makes finding a qualified psychologist as straightforward as possible, while maintaining the human warmth that therapy requires.",
      imageId: imgAboutStory,
    },
    {
      page: "about", sectionKey: "our_mission", sortOrder: 20, isVisible: true,
      title: "Our Mission",
      subtitle: "Making quality mental health care accessible to all",
      content: "Our mission is simple: to connect every person who needs psychological support with a qualified professional who can help. We believe that geography, busy schedules, and financial barriers should not prevent anyone from accessing the care they deserve. Through our platform, we make it easier to find the right psychologist, book appointments that fit your life, and take that first step toward well-being.",
      imageId: imgAboutMission,
    },
    {
      page: "about", sectionKey: "core_values", sortOrder: 30, isVisible: true,
      title: "Our Core Values",
      subtitle: "What guides everything we do",
      content: "These principles shape every decision we make — from how we vet our psychologists to how we design our booking experience.",
      imageId: imgAboutValues,
      metadata: {
        items: [
          { title: "Compassion", description: "We approach every interaction — with clients, psychologists, and partners — with empathy and genuine care." },
          { title: "Evidence-Based", description: "All our psychologists practise evidence-based therapies, and our recommendations are grounded in research." },
          { title: "Inclusivity", description: "We welcome people of all backgrounds, identities, and circumstances. Mental health care is for everyone." },
          { title: "Growth", description: "We are committed to continuous learning — for our clients, our psychologists, and our organisation." },
          { title: "Integrity", description: "We are transparent, honest, and accountable in everything we do." },
          { title: "Accessibility", description: "We work constantly to reduce barriers — financial, geographic, and cultural — to mental health support." },
        ],
      },
    },
    {
      page: "about", sectionKey: "team", sortOrder: 40, isVisible: true,
      title: "Meet Our Team",
      subtitle: "Our team of qualified, experienced professionals are dedicated to your well-being.",
      content: null,
    },
  ];
  for (const s of aboutSections) {
    await prisma.pageSection.upsert({
      where: { page_sectionKey: { page: s.page, sectionKey: s.sectionKey } },
      update: { title: s.title, subtitle: s.subtitle, content: s.content ?? null, sortOrder: s.sortOrder, imageId: (s as any).imageId ?? null, metadata: (s as any).metadata ?? undefined },
      create: s as any,
    });
  }
  console.log("✓ About sections (5)");

  // ── Psychologists ──────────────────────────────────────────────────────
  const psychPass = await hash("Psych123#", 12);
  const psychData = [
    {
      email: "dr.sofia.andreou@psychpractice.com", name: "Dr. Sofia Andreou",
      bio: "I am a licensed clinical psychologist with over 12 years of experience working with adults, couples, and families. My approach is warm, collaborative, and evidence-based. I specialise in anxiety disorders, trauma, and relationship difficulties, drawing on CBT, ACT, and psychodynamic techniques.\n\nI believe therapy is a partnership. My goal is to create a safe, non-judgemental space where you feel truly heard and supported in making meaningful change.",
      specialties: ["Anxiety", "Trauma & PTSD", "Couples Therapy", "CBT"], location: "Lisbon, Portugal", phone: "+351 912 345 678",
      linkedinUrl: "https://linkedin.com/in/sofiaandreou",
      studies: "PhD in Clinical Psychology — University of Lisbon (2010)\nMSc in Psychotherapy — ISPA (2007)",
      qualifications: "Licensed Clinical Psychologist — Portuguese Psychologists Order (#4821)\nCertified CBT Practitioner — EABCT",
      availabilities: [{ dayOfWeek: 1, startTime: "09:00", endTime: "18:00" }, { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" }, { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" }],
      serviceNames: ["Individual Therapy", "Couples Therapy", "Online Consultation"], imageId: imgPsychSofia,
    },
    {
      email: "dr.marco.ferreira@psychpractice.com", name: "Dr. Marco Ferreira",
      bio: "As a psychologist specialising in depression, burnout, and men's mental health, I bring a practical, solution-focused perspective to therapy. Over 8 years I've worked in clinical, corporate, and community settings.\n\nI use an integrative approach combining CBT, mindfulness, and positive psychology to help clients build resilience and regain a sense of purpose.",
      specialties: ["Depression", "Burnout", "Mindfulness", "Men's Mental Health"], location: "Porto, Portugal", phone: "+351 934 567 890",
      linkedinUrl: "https://linkedin.com/in/marcoferreira-psych",
      studies: "MSc in Clinical and Health Psychology — University of Porto (2014)\nPostgraduate Diploma in MBCT — Porto Business School (2017)",
      qualifications: "Licensed Psychologist — Portuguese Psychologists Order (#6103)\nMBCT Certified Practitioner",
      availabilities: [{ dayOfWeek: 1, startTime: "10:00", endTime: "19:00" }, { dayOfWeek: 3, startTime: "10:00", endTime: "19:00" }, { dayOfWeek: 5, startTime: "09:00", endTime: "15:00" }],
      serviceNames: ["Individual Therapy", "Online Consultation", "Psychological Assessment"], imageId: imgPsychMarco,
    },
    {
      email: "dr.ana.silva@psychpractice.com", name: "Dr. Ana Silva",
      bio: "I am a child and adolescent psychologist with a passion for helping young people and their families. With 9 years of experience in schools, clinics, and private practice, I specialise in developmental issues, ADHD, and family dynamics.\n\nI use play therapy, narrative therapy, and systemic approaches, always collaborating with parents and caregivers to support lasting change.",
      specialties: ["Child & Adolescent", "ADHD", "Family Therapy", "Parenting"], location: "Lisbon, Portugal", phone: "+351 926 789 012",
      studies: "MSc in Educational Psychology — University of Minho (2013)\nSpecialisation in Child & Adolescent Psychotherapy — Lisbon School of Health (2015)",
      qualifications: "Licensed Psychologist — Portuguese Psychologists Order (#5677)\nCertified Play Therapist — BAPT",
      availabilities: [{ dayOfWeek: 2, startTime: "09:00", endTime: "17:00" }, { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" }, { dayOfWeek: 6, startTime: "09:00", endTime: "13:00" }],
      serviceNames: ["Child & Adolescent Therapy", "Family Therapy", "Psychological Assessment"], imageId: imgPsychAna,
    },
    {
      email: "dr.elena.vasquez@psychpractice.com", name: "Dr. Elena Vasquez",
      bio: "I am a clinical psychologist specialising in mood disorders, depression, and emotional regulation. Over 10 years of practice have taught me that every client's journey is unique, and I tailor my approach accordingly.\n\nMy work is grounded in DBT and schema therapy, helping clients build lasting emotional stability and a deeper sense of self.",
      specialties: ["Depression", "Mood Disorders", "DBT", "Emotional Regulation"], location: "Lisbon, Portugal", phone: "+351 918 234 567",
      studies: "PhD in Clinical Psychology — University of Salamanca (2012)\nPostgraduate Training in DBT — Behavioural Tech (2015)",
      qualifications: "Licensed Clinical Psychologist — Portuguese Psychologists Order (#5210)\nDBT-Linehan Board of Certification",
      availabilities: [{ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }, { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" }, { dayOfWeek: 4, startTime: "13:00", endTime: "19:00" }],
      serviceNames: ["Individual Therapy", "Online Consultation"], imageId: imgPsychElena,
    },
    {
      email: "dr.david.chen@psychpractice.com", name: "Dr. David Chen",
      bio: "I specialise in ADHD, executive function, and neurodevelopmental conditions in adults and adolescents. Having been trained in both clinical psychology and neuropsychology, I offer assessments and targeted interventions.\n\nMy clients often describe feeling finally understood — and finding practical tools that work with, not against, how their brain operates.",
      specialties: ["ADHD", "Executive Function", "Neuropsychology", "Cognitive Assessment"], location: "Porto, Portugal", phone: "+351 939 876 543",
      studies: "MSc in Clinical Neuropsychology — University of Porto (2015)\nPostgraduate Diploma in ADHD — ADDISS (2018)",
      qualifications: "Licensed Psychologist — Portuguese Psychologists Order (#7341)\nCertified ADHD Professional — CHADD",
      availabilities: [{ dayOfWeek: 2, startTime: "09:00", endTime: "18:00" }, { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" }, { dayOfWeek: 5, startTime: "09:00", endTime: "14:00" }],
      serviceNames: ["Individual Therapy", "Psychological Assessment", "Online Consultation"], imageId: imgPsychDavid,
    },
    {
      email: "dr.maria.santos@psychpractice.com", name: "Dr. Maria Santos",
      bio: "My practice focuses on eating disorders, body image concerns, and the complex relationship between food, identity, and self-worth. I take a compassionate, non-diet approach, working with clients across the spectrum of disordered eating.\n\nI integrate CBT-E, ACT, and somatic approaches, helping clients reconnect with their bodies and build a more peaceful relationship with food.",
      specialties: ["Eating Disorders", "Body Image", "ACT", "Somatic Therapy"], location: "Lisbon, Portugal", phone: "+351 927 654 321",
      studies: "MSc in Clinical Psychology — University of Lisbon (2013)\nSpecialisation in Eating Disorders — Centro de Investigação e Intervenção Social (2016)",
      qualifications: "Licensed Psychologist — Portuguese Psychologists Order (#6089)\nCertified CBT-E Practitioner",
      availabilities: [{ dayOfWeek: 1, startTime: "10:00", endTime: "18:00" }, { dayOfWeek: 3, startTime: "10:00", endTime: "18:00" }, { dayOfWeek: 5, startTime: "10:00", endTime: "15:00" }],
      serviceNames: ["Individual Therapy", "Online Consultation"], imageId: imgPsychMaria,
    },
    {
      email: "dr.james.mitchell@psychpractice.com", name: "Dr. James Mitchell",
      bio: "I am a specialist in addiction, substance misuse, and behaviour change. With a background in motivational interviewing and CBT, I help clients understand the function of their addictive behaviours and build sustainable alternatives.\n\nI work with compassion and without judgement, recognising that addiction is a complex response to pain — not a moral failing.",
      specialties: ["Addiction", "Substance Abuse", "Motivational Interviewing", "Behaviour Change"], location: "Coimbra, Portugal", phone: "+351 916 543 210",
      studies: "MSc in Health Psychology — University of Coimbra (2011)\nPostgraduate Certificate in Addiction Counselling — ICAP (2013)",
      qualifications: "Licensed Psychologist — Portuguese Psychologists Order (#4956)\nMI Network Member — MINT",
      availabilities: [{ dayOfWeek: 2, startTime: "09:00", endTime: "17:00" }, { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" }, { dayOfWeek: 6, startTime: "09:00", endTime: "13:00" }],
      serviceNames: ["Individual Therapy", "Online Consultation"], imageId: imgPsychJames,
    },
    {
      email: "dr.sarah.thompson@psychpractice.com", name: "Dr. Sarah Thompson",
      bio: "Grief, loss, and life transitions are at the heart of my practice. Whether you have experienced bereavement, the end of a relationship, job loss, or any major change, I provide a gentle, supportive space to process what you are going through.\n\nI draw on narrative therapy, compassion-focused therapy, and meaning-centred approaches to help clients find their footing again.",
      specialties: ["Grief", "Loss", "Life Transitions", "Compassion-Focused Therapy"], location: "Porto, Portugal", phone: "+351 938 765 432",
      studies: "MSc in Counselling Psychology — University of Porto (2014)\nAdvanced Certificate in Grief Therapy — GriefWork Center (2017)",
      qualifications: "Licensed Psychologist — Portuguese Psychologists Order (#6789)",
      availabilities: [{ dayOfWeek: 1, startTime: "10:00", endTime: "18:00" }, { dayOfWeek: 2, startTime: "10:00", endTime: "18:00" }, { dayOfWeek: 5, startTime: "10:00", endTime: "16:00" }],
      serviceNames: ["Individual Therapy", "Online Consultation"], imageId: imgPsychSarah,
    },
    {
      email: "dr.thomas.weber@psychpractice.com", name: "Dr. Thomas Weber",
      bio: "My speciality is anxiety disorders, OCD, and specific phobias. I am a committed practitioner of Exposure and Response Prevention (ERP) and CBT, which have the strongest evidence base for these conditions.\n\nI help clients move from avoidance and control-seeking to full engagement with their lives — one manageable step at a time.",
      specialties: ["OCD", "Phobias", "ERP", "Anxiety Disorders"], location: "Lisbon, Portugal", phone: "+351 912 876 543",
      studies: "MSc in Clinical Psychology — Technical University of Lisbon (2012)\nAdvanced Training in ERP — IOCDF (2016)",
      qualifications: "Licensed Psychologist — Portuguese Psychologists Order (#5901)\nOCDI Certified ERP Specialist",
      availabilities: [{ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }, { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" }, { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" }],
      serviceNames: ["Individual Therapy", "Online Consultation"], imageId: imgPsychThomas,
    },
    {
      email: "dr.amira.hassan@psychpractice.com", name: "Dr. Amira Hassan",
      bio: "I am a psychologist with a particular interest in cultural identity, acculturation, and the mental health of immigrant and diaspora communities. I am multilingual (Arabic, English, Portuguese, French) and sensitive to the intersection of culture, religion, and well-being.\n\nMy practice is informed by culturally adapted CBT, narrative therapy, and an intersectional lens.",
      specialties: ["Cultural Identity", "Immigration", "Multicultural Counselling", "Acculturation"], location: "Lisbon, Portugal", phone: "+351 925 432 109",
      studies: "PhD in Cross-Cultural Psychology — University of Lisbon (2016)\nMSc in Clinical Psychology — American University of Beirut (2011)",
      qualifications: "Licensed Clinical Psychologist — Portuguese Psychologists Order (#7102)",
      availabilities: [{ dayOfWeek: 2, startTime: "10:00", endTime: "18:00" }, { dayOfWeek: 4, startTime: "10:00", endTime: "18:00" }, { dayOfWeek: 5, startTime: "10:00", endTime: "16:00" }],
      serviceNames: ["Individual Therapy", "Couples Therapy", "Online Consultation"], imageId: imgPsychAmira,
    },
    {
      email: "dr.carlos.mendes@psychpractice.com", name: "Dr. Carlos Mendes",
      bio: "I work at the intersection of psychology and professional life — helping clients navigate career transitions, workplace stress, burnout prevention, and leadership challenges. My background includes several years as an organisational psychologist before moving into clinical practice.\n\nI use a solution-focused, strengths-based approach combined with CBT and psychodynamic insights.",
      specialties: ["Career Counselling", "Work Stress", "Burnout Prevention", "Leadership"], location: "Porto, Portugal", phone: "+351 933 210 987",
      linkedinUrl: "https://linkedin.com/in/carlosmendes-psych",
      studies: "MSc in Organisational and Clinical Psychology — University of Porto (2010)\nMBA — Porto Business School (2013)",
      qualifications: "Licensed Psychologist — Portuguese Psychologists Order (#4567)\nRegistered Coaching Psychologist — ISCP",
      availabilities: [{ dayOfWeek: 1, startTime: "09:00", endTime: "18:00" }, { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" }, { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" }],
      serviceNames: ["Individual Therapy", "Online Consultation", "Psychological Assessment"], imageId: imgPsychCarlos,
    },
    {
      email: "dr.lisa.park@psychpractice.com", name: "Dr. Lisa Park",
      bio: "Relationships — romantic, family, friendship, and professional — are central to our well-being, and central to my practice. I help individuals and couples communicate more effectively, navigate conflict, and build deeper connection.\n\nI am trained in EFT (Emotionally Focused Therapy) and the Gottman Method, two of the most evidence-based approaches for relationship work.",
      specialties: ["Relationship Issues", "Couples Therapy", "EFT", "Communication"], location: "Coimbra, Portugal", phone: "+351 917 345 678",
      studies: "MSc in Counselling and Psychotherapy — University of Coimbra (2013)\nAdvanced Training in EFT — ICEEFT (2017)\nLevel 1 & 2 Gottman Method Couples Therapy",
      qualifications: "Licensed Psychologist — Portuguese Psychologists Order (#6234)",
      availabilities: [{ dayOfWeek: 2, startTime: "10:00", endTime: "18:00" }, { dayOfWeek: 3, startTime: "10:00", endTime: "18:00" }, { dayOfWeek: 6, startTime: "10:00", endTime: "14:00" }],
      serviceNames: ["Individual Therapy", "Couples Therapy", "Online Consultation"], imageId: imgPsychLisa,
    },
    {
      email: "dr.michael.brown@psychpractice.com", name: "Dr. Michael Brown",
      bio: "I am a psychologist specialising in trauma, PTSD, and the unique mental health challenges faced by military veterans and first responders. I have worked extensively in veteran support programmes and bring deep respect for service alongside clinical expertise.\n\nI use EMDR, prolonged exposure, and trauma-focused CBT — approaches with the strongest evidence for trauma recovery.",
      specialties: ["PTSD", "Trauma", "EMDR", "Veterans"], location: "Lisbon, Portugal", phone: "+351 921 098 765",
      studies: "PhD in Clinical Psychology — University of Lisbon (2013)\nPostgraduate Training in EMDR — EMDR Europe (2016)\nSpecialisation in Military Psychology — NATO School (2014)",
      qualifications: "Licensed Clinical Psychologist — Portuguese Psychologists Order (#5432)\nEMDR Europe Accredited Practitioner",
      availabilities: [{ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }, { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" }, { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" }],
      serviceNames: ["Individual Therapy", "Online Consultation", "Psychological Assessment"], imageId: imgPsychMichael,
    },
  ];

  const psychUsers: Record<string, string> = {};
  for (const p of psychData) {
    const user = await prisma.user.upsert({
      where: { email: p.email }, update: {},
      create: { email: p.email, name: p.name, passwordHash: psychPass, role: "PSYCHOLOGIST", isApproved: true },
    });
    psychUsers[p.email] = user.id;

    const profile = await prisma.psychologistProfile.upsert({
      where: { userId: user.id },
      update: { profileImageId: p.imageId },
      create: { userId: user.id, bio: p.bio, specialties: p.specialties, location: p.location, phone: p.phone, linkedinUrl: (p as any).linkedinUrl ?? null, studies: p.studies, qualifications: p.qualifications, profileImageId: p.imageId },
    });

    await prisma.availability.deleteMany({ where: { psychologistId: profile.id } });
    for (const av of p.availabilities) {
      await prisma.availability.create({ data: { psychologistId: profile.id, ...av, isActive: true } });
    }

    await prisma.psychologistService.deleteMany({ where: { psychologistId: profile.id } });
    for (const svcName of p.serviceNames) {
      const svcId = services[svcName];
      if (svcId) await prisma.psychologistService.create({ data: { psychologistId: profile.id, serviceId: svcId } });
    }
  }
  console.log("✓ Psychologists (13)");

  // ── Clients (23 total) ─────────────────────────────────────────────────
  const clientPass = await hash("Client123#", 12);
  const clientData = [
    { email: "alice.johnson@example.com", name: "Alice Johnson" },
    { email: "tom.baker@example.com", name: "Tom Baker" },
    { email: "maria.costa@example.com", name: "Maria Costa" },
    { email: "james.wilson@example.com", name: "James Wilson" },
    { email: "sophie.martin@example.com", name: "Sophie Martin" },
    { email: "rafael.oliveira@example.com", name: "Rafael Oliveira" },
    { email: "emily.chen@example.com", name: "Emily Chen" },
    { email: "david.smith@example.com", name: "David Smith" },
    { email: "ana.rodrigues@example.com", name: "Ana Rodrigues" },
    { email: "lucas.brown@example.com", name: "Lucas Brown" },
    { email: "isabelle.dupont@example.com", name: "Isabelle Dupont" },
    { email: "omar.hassan@example.com", name: "Omar Hassan" },
    { email: "chloe.taylor@example.com", name: "Chloe Taylor" },
    { email: "matteo.romano@example.com", name: "Matteo Romano" },
    { email: "priya.sharma@example.com", name: "Priya Sharma" },
    { email: "oliver.white@example.com", name: "Oliver White" },
    { email: "amelia.jones@example.com", name: "Amelia Jones" },
    { email: "noah.garcia@example.com", name: "Noah Garcia" },
    { email: "mia.roberts@example.com", name: "Mia Roberts" },
    { email: "ethan.lewis@example.com", name: "Ethan Lewis" },
    { email: "fatima.ali@example.com", name: "Fatima Ali" },
    { email: "henrik.andersen@example.com", name: "Henrik Andersen" },
    { email: "lena.meyer@example.com", name: "Lena Meyer" },
  ];
  const clientUsers: string[] = [];
  for (const c of clientData) {
    const user = await prisma.user.upsert({
      where: { email: c.email }, update: {},
      create: { email: c.email, name: c.name, passwordHash: clientPass, role: "CLIENT", isApproved: true },
    });
    clientUsers.push(user.id);
  }
  console.log("✓ Clients (23)");

  // ── Appointments (30) ──────────────────────────────────────────────────
  const psychUserIds = Object.values(psychUsers);
  const now = new Date();
  function daysAgo(d: number, h = 10): Date { const t = new Date(now); t.setDate(t.getDate() - d); t.setHours(h, 0, 0, 0); return t; }
  function daysAhead(d: number, h = 10): Date { const t = new Date(now); t.setDate(t.getDate() + d); t.setHours(h, 0, 0, 0); return t; }
  function addMins(d: Date, m: number): Date { return new Date(d.getTime() + m * 60000); }

  const appts = [
    // Past COMPLETED
    { clientId: clientUsers[0], psychologistId: psychUserIds[0], serviceId: services["Individual Therapy"], dateTime: daysAgo(90, 10), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[1], psychologistId: psychUserIds[1], serviceId: services["Online Consultation"], dateTime: daysAgo(85, 14), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[2], psychologistId: psychUserIds[2], serviceId: services["Family Therapy"], dateTime: daysAgo(80, 11), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[3], psychologistId: psychUserIds[3], serviceId: services["Individual Therapy"], dateTime: daysAgo(75, 9), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[4], psychologistId: psychUserIds[4], serviceId: services["Psychological Assessment"], dateTime: daysAgo(70, 10), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[5], psychologistId: psychUserIds[5], serviceId: services["Individual Therapy"], dateTime: daysAgo(65, 15), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[6], psychologistId: psychUserIds[6], serviceId: services["Online Consultation"], dateTime: daysAgo(60, 10), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[7], psychologistId: psychUserIds[7], serviceId: services["Individual Therapy"], dateTime: daysAgo(55, 11), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[8], psychologistId: psychUserIds[8], serviceId: services["Individual Therapy"], dateTime: daysAgo(50, 10), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[9], psychologistId: psychUserIds[9], serviceId: services["Couples Therapy"], dateTime: daysAgo(45, 14), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[10], psychologistId: psychUserIds[10], serviceId: services["Online Consultation"], dateTime: daysAgo(40, 9), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[11], psychologistId: psychUserIds[11], serviceId: services["Individual Therapy"], dateTime: daysAgo(35, 10), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[12], psychologistId: psychUserIds[12], serviceId: services["Individual Therapy"], dateTime: daysAgo(30, 11), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[0], psychologistId: psychUserIds[0], serviceId: services["Individual Therapy"], dateTime: daysAgo(28, 10), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[1], psychologistId: psychUserIds[1], serviceId: services["Online Consultation"], dateTime: daysAgo(21, 14), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[2], psychologistId: psychUserIds[2], serviceId: services["Child & Adolescent Therapy"], dateTime: daysAgo(18, 9), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[3], psychologistId: psychUserIds[3], serviceId: services["Individual Therapy"], dateTime: daysAgo(14, 10), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[4], psychologistId: psychUserIds[4], serviceId: services["Individual Therapy"], dateTime: daysAgo(10, 11), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[5], psychologistId: psychUserIds[5], serviceId: services["Online Consultation"], dateTime: daysAgo(7, 10), status: AppointmentStatus.COMPLETED },
    { clientId: clientUsers[6], psychologistId: psychUserIds[6], serviceId: services["Individual Therapy"], dateTime: daysAgo(3, 15), status: AppointmentStatus.COMPLETED },
    // Past CANCELLED
    { clientId: clientUsers[13], psychologistId: psychUserIds[0], serviceId: services["Individual Therapy"], dateTime: daysAgo(20, 10), status: AppointmentStatus.CANCELLED },
    { clientId: clientUsers[14], psychologistId: psychUserIds[2], serviceId: services["Online Consultation"], dateTime: daysAgo(12, 14), status: AppointmentStatus.CANCELLED },
    // Upcoming CONFIRMED
    { clientId: clientUsers[15], psychologistId: psychUserIds[0], serviceId: services["Individual Therapy"], dateTime: daysAhead(2, 10), status: AppointmentStatus.CONFIRMED },
    { clientId: clientUsers[16], psychologistId: psychUserIds[1], serviceId: services["Online Consultation"], dateTime: daysAhead(3, 14), status: AppointmentStatus.CONFIRMED },
    { clientId: clientUsers[17], psychologistId: psychUserIds[3], serviceId: services["Couples Therapy"], dateTime: daysAhead(5, 11), status: AppointmentStatus.CONFIRMED },
    { clientId: clientUsers[18], psychologistId: psychUserIds[4], serviceId: services["Individual Therapy"], dateTime: daysAhead(7, 10), status: AppointmentStatus.CONFIRMED },
    { clientId: clientUsers[19], psychologistId: psychUserIds[6], serviceId: services["Psychological Assessment"], dateTime: daysAhead(10, 9), status: AppointmentStatus.CONFIRMED },
    // Upcoming PENDING
    { clientId: clientUsers[20], psychologistId: psychUserIds[7], serviceId: services["Individual Therapy"], dateTime: daysAhead(4, 10), status: AppointmentStatus.PENDING },
    { clientId: clientUsers[21], psychologistId: psychUserIds[8], serviceId: services["Online Consultation"], dateTime: daysAhead(6, 14), status: AppointmentStatus.PENDING },
    { clientId: clientUsers[22], psychologistId: psychUserIds[9], serviceId: services["Individual Therapy"], dateTime: daysAhead(8, 11), status: AppointmentStatus.PENDING },
  ];

  for (const appt of appts) {
    const svcDuration = appt.serviceId === services["Family Therapy"] ? 75 : appt.serviceId === services["Psychological Assessment"] ? 90 : appt.serviceId === services["Couples Therapy"] ? 60 : 50;
    const exists = await prisma.appointment.findFirst({ where: { clientId: appt.clientId, psychologistId: appt.psychologistId, dateTime: appt.dateTime } });
    if (!exists) {
      await prisma.appointment.create({ data: { ...appt, endTime: addMins(appt.dateTime, svcDuration) } });
    }
  }
  console.log("✓ Appointments (30)");

  // ── Blog posts (15) ────────────────────────────────────────────────────
  const blogPosts = [
    {
      authorEmail: "dr.sofia.andreou@psychpractice.com",
      title: "Understanding Anxiety: What It Is and How to Manage It",
      slug: "understanding-anxiety-what-it-is-and-how-to-manage-it",
      excerpt: "Anxiety is one of the most common mental health challenges. Here we explore what anxiety really is and practical evidence-based strategies you can use today.",
      content: `<h2>What is Anxiety?</h2><p>Anxiety is a natural human response to perceived threat or uncertainty. While some anxiety is normal and even helpful, chronic anxiety can significantly interfere with daily life.</p><h2>How Anxiety Manifests</h2><ul><li><strong>Physical:</strong> racing heart, shallow breathing, tension, fatigue</li><li><strong>Cognitive:</strong> excessive worry, difficulty concentrating, catastrophic thinking</li><li><strong>Behavioural:</strong> avoidance, reassurance-seeking, procrastination</li></ul><h2>Evidence-Based Strategies</h2><h3>1. Cognitive Behavioural Therapy (CBT)</h3><p>CBT helps you identify and challenge unhelpful thought patterns. By examining the evidence for and against your anxious thoughts, you can develop a more balanced perspective.</p><h3>2. Mindful Breathing</h3><p>Slow, diaphragmatic breathing activates the parasympathetic nervous system. Try inhaling for 4 counts, holding for 4, and exhaling for 6.</p><h3>3. Gradual Exposure</h3><p>Avoidance feeds anxiety. Gradually facing what you fear — at a manageable pace — helps your brain learn that the threat is not as dangerous as it seems.</p><h2>When to Seek Help</h2><p>If anxiety is affecting your sleep, relationships, work, or quality of life, it's worth speaking to a qualified psychologist.</p>`,
      categorySlug: "anxiety", imageId: imgBlogAnxiety, daysAgo: 85,
    },
    {
      authorEmail: "dr.marco.ferreira@psychpractice.com",
      title: "Burnout vs. Stress: How to Tell the Difference",
      slug: "burnout-vs-stress-how-to-tell-the-difference",
      excerpt: "Many people confuse burnout with stress. Understanding the distinction matters enormously for how you recover.",
      content: `<h2>The Key Difference</h2><p>Stress is characterised by <em>too much</em>: too many pressures, too many demands. Burnout, on the other hand, is characterised by <em>not enough</em>: not enough energy, motivation, or care.</p><h2>Signs of Burnout</h2><ul><li>Chronic exhaustion that sleep doesn't fix</li><li>Increasing cynicism or detachment from work</li><li>A sense of ineffectiveness and lack of accomplishment</li><li>Loss of satisfaction in activities you once enjoyed</li></ul><h2>The Three Dimensions of Burnout</h2><p>Researchers Maslach and Leiter identified three core components: exhaustion, cynicism, and reduced efficacy. All three must be present for a true diagnosis of burnout.</p><h2>Recovery</h2><p>Recovering from burnout requires more than a holiday. It involves identifying root causes, rebuilding sustainable routines, re-engaging with meaning, and often seeking professional support.</p>`,
      categorySlug: "stress-management", imageId: imgBlogBurnout, daysAgo: 78,
    },
    {
      authorEmail: "dr.ana.silva@psychpractice.com",
      title: "Supporting Your Child Through Anxiety: A Guide for Parents",
      slug: "supporting-your-child-through-anxiety-guide-for-parents",
      excerpt: "Childhood anxiety is more common than many parents realise. This guide offers practical, evidence-based ways to support your child without reinforcing their fears.",
      content: `<h2>Recognising Anxiety in Children</h2><p>Children often can't articulate their feelings. Instead of saying "I'm anxious," they might complain of stomach aches, refuse school, cling, or withdraw.</p><h2>Support Without Accommodation</h2><p>Too much reassurance can backfire. When we constantly rescue children from discomfort, we confirm their belief that the world is dangerous. The goal is to be a <strong>safe base, not a safe house</strong>.</p><h2>Practical Strategies</h2><h3>Validate, Then Encourage</h3><p>Say "I understand that feels scary" before "but you can do it." Validation first builds trust and reduces emotional intensity.</p><h3>Use a Worry Time</h3><p>Designate 10–15 minutes a day for worries. This prevents anxiety from spilling into every moment.</p><h3>Breathing Exercises</h3><p>Teach simple breathing exercises. Make it playful and practise when they're calm, not mid-anxiety.</p><h2>When to Seek Help</h2><p>If anxiety is affecting school attendance, friendships, sleep, or eating, a child psychologist can provide targeted support.</p>`,
      categorySlug: "parenting", imageId: imgBlogParenting, daysAgo: 70,
    },
    {
      authorEmail: "dr.sofia.andreou@psychpractice.com",
      title: "The Science of Self-Compassion: Why Being Kind to Yourself Matters",
      slug: "science-of-self-compassion-why-being-kind-to-yourself-matters",
      excerpt: "Research consistently shows that self-compassion — not self-criticism — is the foundation of emotional resilience.",
      content: `<h2>What Self-Compassion Means</h2><p>Self-compassion, as defined by Dr. Kristin Neff, has three components: self-kindness, common humanity, and mindfulness.</p><h2>The Research</h2><p>Studies show that higher self-compassion is associated with lower anxiety and depression, greater resilience after failure, better motivation, healthier relationships, and increased life satisfaction.</p><h2>The Self-Criticism Trap</h2><p>Many people believe self-criticism motivates them. Research suggests the opposite: harsh self-judgment activates the threat system, narrowing thinking and triggering shame.</p><h2>A Simple Practice</h2><p>Try this self-compassion break: "This is a moment of suffering." (Mindfulness) → "Suffering is part of life. I am not alone." (Common humanity) → "May I be kind to myself right now." (Self-kindness)</p>`,
      categorySlug: "self-care", imageId: imgBlogSelfcare, daysAgo: 63,
    },
    {
      authorEmail: "dr.marco.ferreira@psychpractice.com",
      title: "5 Evidence-Based Mindfulness Techniques for Daily Life",
      slug: "5-evidence-based-mindfulness-techniques-for-daily-life",
      excerpt: "Mindfulness doesn't require hours of meditation. These five practical techniques take minutes and are backed by solid research.",
      content: `<h2>Why Mindfulness Works</h2><p>Mindfulness — paying attention to the present moment without judgement — has been shown in hundreds of studies to reduce stress, improve focus, and enhance well-being.</p><h3>1. The 5-4-3-2-1 Grounding Exercise</h3><p>Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This interrupts rumination and anchors you in the present.</p><h3>2. Mindful Coffee</h3><p>Instead of scrolling while you drink your morning coffee, give it your full attention. One intentional minute can shift your nervous system.</p><h3>3. Body Scan Check-In</h3><p>Twice a day, scan from head to toe. Where is there tension? Simply noticing — without trying to change anything — reduces physical stress responses.</p><h3>4. Mindful Walking</h3><p>Feel each footstep, notice the air on your skin. Research shows even 10 minutes of mindful walking reduces cortisol.</p><h3>5. The STOP Technique</h3><p><strong>S</strong>top. <strong>T</strong>ake a breath. <strong>O</strong>bserve thoughts and feelings. <strong>P</strong>roceed with awareness.</p>`,
      categorySlug: "mindfulness", imageId: imgBlogMindfulness, daysAgo: 56,
    },
    {
      authorEmail: "dr.lisa.park@psychpractice.com",
      title: "Building Healthy Relationships: What the Research Tells Us",
      slug: "building-healthy-relationships-what-research-tells-us",
      excerpt: "Strong relationships are one of the most powerful predictors of mental and physical health. Here's what science says makes them work.",
      content: `<h2>Why Relationships Matter</h2><p>Decades of research — from the Harvard Study of Adult Development to Brené Brown's work on vulnerability — consistently show that the quality of our relationships is the single greatest predictor of long-term happiness and health.</p><h2>The Gottman Principles</h2><p>Dr. John Gottman identified four communication patterns that reliably predict relationship breakdown — criticism, contempt, defensiveness, and stonewalling. The antidote to each is learnable and practisable.</p><h2>Turning Towards</h2><p>Gottman's research shows that couples who stay together long-term respond to each other's "bids for connection" — small attempts to engage — roughly 87% of the time. It's the small moments, not the grand gestures, that build lasting bonds.</p><h2>Conflict as Opportunity</h2><p>Healthy couples don't avoid conflict — they navigate it with respect and curiosity. The goal of a conflict conversation isn't to win; it's to understand. When you shift from "you're wrong" to "help me understand your perspective," everything changes.</p><h2>Building a Culture of Appreciation</h2><p>Actively scanning for what your partner or loved one does well — and expressing it — creates what Gottman calls a "positive sentiment override," making minor irritations less likely to escalate.</p>`,
      categorySlug: "relationships", imageId: imgBlogRelationships, daysAgo: 49,
    },
    {
      authorEmail: "dr.thomas.weber@psychpractice.com",
      title: "The Importance of Sleep for Mental Health",
      slug: "importance-of-sleep-for-mental-health",
      excerpt: "Sleep and mental health are deeply intertwined. Poor sleep doesn't just make you tired — it profoundly affects your mood, cognition, and emotional regulation.",
      content: `<h2>The Brain During Sleep</h2><p>During sleep, the brain processes emotional memories, consolidates learning, clears metabolic waste via the glymphatic system, and regulates the stress-response system. Disrupting this process has wide-ranging consequences.</p><h2>Sleep Deprivation and Mental Health</h2><p>Even one night of poor sleep increases amygdala reactivity by up to 60%, making us more emotionally reactive and less able to regulate our responses. Chronic sleep problems are both a symptom and a cause of anxiety, depression, and PTSD.</p><h2>CBT for Insomnia (CBT-I)</h2><p>CBT-I is the gold-standard treatment for chronic insomnia, outperforming medication in long-term outcomes. It addresses the thoughts and behaviours that perpetuate poor sleep rather than masking symptoms.</p><h2>Sleep Hygiene: What Actually Helps</h2><ul><li>Consistent sleep and wake times (even on weekends)</li><li>Cool, dark room (around 18°C is optimal)</li><li>No screens 60 minutes before bed (blue light suppresses melatonin)</li><li>Avoid caffeine after 2pm</li><li>If you can't sleep after 20 minutes, get up and do something calming</li></ul>`,
      categorySlug: "sleep-rest", imageId: imgBlogSleep, daysAgo: 42,
    },
    {
      authorEmail: "dr.carlos.mendes@psychpractice.com",
      title: "Exercise and Mental Wellness: More Than Just Physical Benefits",
      slug: "exercise-and-mental-wellness-more-than-physical-benefits",
      excerpt: "The evidence is unambiguous: regular physical activity is one of the most powerful tools we have for mental health — often as effective as medication for mild to moderate depression.",
      content: `<h2>The Neuroscience of Exercise</h2><p>Exercise increases levels of BDNF (brain-derived neurotrophic factor), often called "fertiliser for the brain." It promotes the growth of new neurons in the hippocampus — a region critical for memory and mood regulation that shrinks with chronic stress and depression.</p><h2>Exercise and Depression</h2><p>A landmark meta-analysis found that exercise is as effective as antidepressants for mild to moderate depression, with fewer side effects and lasting benefits. A study by Blumenthal et al. found that after 16 weeks, patients who exercised had lower relapse rates than those who took medication alone.</p><h2>The Anxiety Connection</h2><p>Aerobic exercise reduces baseline anxiety by modulating the stress-response system. It also provides a form of "interoceptive exposure" — teaching the brain that a racing heart and fast breathing don't necessarily mean danger.</p><h2>How Much Is Enough?</h2><p>The research suggests that even 20–30 minutes of moderate exercise three times a week produces significant mental health benefits. The type matters less than the consistency. Find something you enjoy and build it into your routine.</p>`,
      categorySlug: "self-care", imageId: imgBlogExercise, daysAgo: 35,
    },
    {
      authorEmail: "dr.elena.vasquez@psychpractice.com",
      title: "Setting Meaningful Goals: A Psychological Perspective",
      slug: "setting-meaningful-goals-a-psychological-perspective",
      excerpt: "Not all goals are created equal. Understanding the psychology of motivation can transform how you approach change.",
      content: `<h2>Intrinsic vs. Extrinsic Motivation</h2><p>Self-Determination Theory, developed by Deci and Ryan, distinguishes between intrinsic motivation (doing something because it's inherently meaningful) and extrinsic motivation (doing something for external reward or to avoid punishment). Goals rooted in intrinsic motivation are more likely to be sustained.</p><h2>The Problem with Pure Outcome Goals</h2><p>Focussing only on outcomes ("lose 10kg", "earn more money") creates a hedonic treadmill — we achieve the goal, feel good briefly, then return to baseline. Process goals and identity goals tend to be more satisfying and more durable.</p><h2>Identity-Based Goals</h2><p>Instead of "I want to run a marathon," try "I am someone who moves their body every day." This subtle reframe, popularised by James Clear in <em>Atomic Habits</em>, aligns behaviour with self-concept — one of the most powerful drivers of sustainable change.</p><h2>Values Clarification</h2><p>ACT (Acceptance and Commitment Therapy) encourages us to set goals that are tethered to our deepest values. Ask yourself: "If I imagine looking back on my life at 80, what would I want to have spent my time on?" Your goals should serve that vision.</p>`,
      categorySlug: "personal-growth", imageId: imgBlogGoals, daysAgo: 28,
    },
    {
      authorEmail: "dr.carlos.mendes@psychpractice.com",
      title: "Managing Workplace Stress: Strategies That Actually Work",
      slug: "managing-workplace-stress-strategies-that-actually-work",
      excerpt: "Work-related stress is the most prevalent occupational health problem in Europe. Here are evidence-based strategies to protect your well-being at work.",
      content: `<h2>The Cost of Workplace Stress</h2><p>The European Agency for Safety and Health at Work estimates that over half of all working days lost are due to work-related stress. Beyond productivity, chronic occupational stress increases the risk of cardiovascular disease, immune suppression, and burnout.</p><h2>Demand-Control-Support Model</h2><p>Robert Karasek's research identified three key variables in workplace stress: demands (workload, pace), control (autonomy, decision latitude), and support (from colleagues and managers). High demand + low control + low support = highest risk. Interventions targeting any of these variables reduce stress.</p><h2>The Micro-Recovery Principle</h2><p>Research on elite performance shows that recovery is as important as effort. Building micro-recoveries into your day — genuine breaks away from work-related thinking — allows the nervous system to reset. Even a 5-minute walk outside has measurable cortisol-reducing effects.</p><h2>Psychological Detachment</h2><p>Sabine Sonnentag's research highlights "psychological detachment" — mentally switching off from work during non-work time — as one of the strongest predictors of work-related well-being. This means not checking emails in the evening, and actively engaging in non-work activities that absorb your attention.</p>`,
      categorySlug: "workplace-wellness", imageId: imgBlogWorkplace, daysAgo: 21,
    },
    {
      authorEmail: "dr.sarah.thompson@psychpractice.com",
      title: "Understanding Grief: There Is No Right Way to Grieve",
      slug: "understanding-grief-there-is-no-right-way-to-grieve",
      excerpt: "Grief is one of the most misunderstood human experiences. This article explores what grief really is — and what actually helps.",
      content: `<h2>Beyond the Stages</h2><p>The popular "five stages of grief" model (Kübler-Ross) was never intended to describe a linear progression through which everyone must pass. Grief is far more individual, non-linear, and complex than that framework suggests. Knowing this can release people from the belief that they are grieving "wrong."</p><h2>Complicated Grief</h2><p>For some people, grief becomes "complicated" or "prolonged" — characterised by intense longing, difficulty accepting the loss, bitterness, and difficulty engaging in life. This is not a sign of weakness; it often reflects the depth of the bond that was lost, and it responds well to specialised grief therapy.</p><h2>What Actually Helps</h2><p>Research on grief support consistently shows that what helps most is not advice or silver linings, but presence, acknowledgement, and the willingness to sit with someone in their pain without trying to fix it. "I'm so sorry. That must be devastating" is more helpful than "at least they lived a full life."</p><h2>Continuing Bonds Theory</h2><p>Modern grief research has moved away from the idea that we must "let go" to heal. Continuing Bonds Theory suggests that maintaining an ongoing, transformed relationship with the person we've lost — through memory, ritual, and inner dialogue — is not pathological but healthy and often essential to integration.</p>`,
      categorySlug: "grief-loss", imageId: imgBlogGrief, daysAgo: 14,
    },
    {
      authorEmail: "dr.amira.hassan@psychpractice.com",
      title: "Social Connection and Mental Health: Why We Need Each Other",
      slug: "social-connection-and-mental-health-why-we-need-each-other",
      excerpt: "Loneliness has been declared a public health epidemic. Understanding why human connection is so essential may help us take it more seriously.",
      content: `<h2>The Loneliness Epidemic</h2><p>Former US Surgeon General Vivek Murthy declared loneliness a public health crisis, citing research showing that lacking social connection is as harmful to health as smoking 15 cigarettes a day. In Europe, one in three people report feeling lonely regularly.</p><h2>The Neuroscience of Connection</h2><p>Human beings are wired for connection. The social engagement system, mediated by the vagus nerve, operates as a continuous feedback loop between our internal state and our social environment. Positive interactions literally regulate our nervous systems — the presence of a trusted person lowers cortisol and blood pressure.</p><h2>Quality Over Quantity</h2><p>Research consistently shows that the depth of social connections matters more than the breadth. Having two or three close relationships in which you feel truly known is more protective than having hundreds of shallow ones. This is important context for the social media age.</p><h2>Building Connection</h2><p>Building genuine connection requires vulnerability — the willingness to be seen, including in our imperfection and struggle. It requires showing up consistently, being curious about others, and the courage to initiate. These are learnable skills, and they are worth developing.</p>`,
      categorySlug: "relationships", imageId: imgBlogSocial, daysAgo: 10,
    },
    {
      authorEmail: "dr.marco.ferreira@psychpractice.com",
      title: "Meditation for Beginners: Starting a Practice That Sticks",
      slug: "meditation-for-beginners-starting-a-practice-that-sticks",
      excerpt: "Most people who try meditation quit within two weeks. Here's what actually makes a meditation practice sustainable — and worth sustaining.",
      content: `<h2>What Meditation Is (and Isn't)</h2><p>Meditation is not the absence of thought. It is the practice of noticing when your attention has wandered and returning it — repeatedly, without self-criticism. The "returning" is the practice. Every moment of noticing is a bicep curl for the attention muscle.</p><h2>The Research</h2><p>Over 700 studies have found that regular meditation reduces self-reported stress and anxiety, improves attention and working memory, reduces activity in the default mode network (associated with rumination), and produces measurable changes in brain structure with consistent practice.</p><h2>Starting Small</h2><p>Research on habit formation suggests that starting with two minutes — yes, two — is more effective than starting with twenty. The goal in the beginning is not duration but consistency: training the brain to associate a cue (time, place, trigger) with the behaviour.</p><h2>Common Obstacles</h2><p>"I can't stop my thoughts" — correct. Nobody can. That's not the goal. "I don't have time" — a two-minute practice done daily beats a forty-minute session done once. "I'm not doing it right" — if you're sitting and attempting to pay attention to your breath, you are doing it right.</p>`,
      categorySlug: "mindfulness", imageId: imgBlogMeditation, daysAgo: 7,
    },
    {
      authorEmail: "dr.elena.vasquez@psychpractice.com",
      title: "Building Emotional Resilience: What It Is and How to Grow It",
      slug: "building-emotional-resilience-what-it-is-and-how-to-grow-it",
      excerpt: "Resilience is not the absence of struggle — it is the capacity to navigate struggle without being permanently derailed. And it can be developed.",
      content: `<h2>What Resilience Is Not</h2><p>Resilience is not stoicism, not "bouncing back" as if nothing happened, and not the absence of pain. People who are highly resilient still suffer — they are simply better able to process that suffering and return to functioning. Importantly, resilience is not a fixed trait. It is a dynamic capacity that can be strengthened.</p><h2>The Four Pillars of Resilience</h2><p>Research by psychologists like George Bonanno, Ann Masten, and Martin Seligman points to four key pillars: connection (having people to turn to), meaning (a sense of purpose that transcends the difficulty), agency (the belief that one can influence outcomes), and flexibility (the ability to adapt and reframe).</p><h2>Post-Traumatic Growth</h2><p>Perhaps the most remarkable finding in resilience research is post-traumatic growth — the paradoxical way in which profound adversity can become a catalyst for positive change. Around a third of trauma survivors report some form of growth: stronger relationships, new possibilities, personal strength, spiritual development, or a greater appreciation for life.</p><h2>Building Your Resilience</h2><p>Practical steps include: cultivating relationships (especially those in which you feel safe to be vulnerable), developing a regular mindfulness practice, reframing adversity as information rather than evidence of permanent failure, and connecting your daily choices to a meaningful purpose larger than yourself.</p>`,
      categorySlug: "personal-growth", imageId: imgBlogResilience, daysAgo: 3,
    },
    {
      authorEmail: "dr.maria.santos@psychpractice.com",
      title: "Setting Healthy Boundaries: Why It's an Act of Self-Respect",
      slug: "setting-healthy-boundaries-why-its-an-act-of-self-respect",
      excerpt: "Boundaries are not walls — they are the structures that allow genuine connection to thrive. Here's how to set them without guilt.",
      content: `<h2>What Boundaries Actually Are</h2><p>A boundary is not a demand you place on someone else's behaviour. It is a statement of what you will and will not do in response to that behaviour. This distinction matters: you cannot control others, but you can control your responses. "I won't continue this conversation if it becomes hostile" is a boundary. "You must stop being hostile" is a demand.</p><h2>Why Boundaries Are Hard</h2><p>For many people — particularly those who grew up in families where saying no was unsafe — the prospect of setting a boundary activates deep fear: of rejection, abandonment, or conflict. The guilt that accompanies boundary-setting is often a conditioned response, not a moral signal.</p><h2>Boundaries and Relationships</h2><p>Contrary to the fear that boundaries will damage relationships, well-communicated boundaries tend to strengthen them. They create clarity about needs, reduce resentment that builds when needs go unexpressed, and demonstrate the self-respect that makes genuine connection possible. People who consistently override their own needs to please others often become resentful — which is far more damaging to relationships than a clearly stated limit.</p><h2>Starting Small</h2><p>You don't need to start with the most difficult person in your life. Start with one small boundary in a lower-stakes context, notice that the relationship survives, and build your capacity and confidence from there.</p>`,
      categorySlug: "self-care", imageId: imgBlogBoundaries, daysAgo: 1,
    },
  ];

  for (const post of blogPosts) {
    const authorId = psychUsers[post.authorEmail];
    if (!authorId) continue;
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    const publishedAt = new Date(now.getTime() - post.daysAgo * 24 * 60 * 60 * 1000);
    if (existing) {
      await prisma.blogPost.update({ where: { slug: post.slug }, data: { featuredImageId: post.imageId, publishedAt, status: BlogPostStatus.PUBLISHED } });
    } else {
      await prisma.blogPost.create({
        data: { title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, authorId, categoryId: categories[post.categorySlug], status: BlogPostStatus.PUBLISHED, publishedAt, featuredImageId: post.imageId },
      });
    }
  }
  console.log("✓ Blog posts (15)");

  // ── Newsletter ─────────────────────────────────────────────────────────
  const newsletterEmails = ["newsletter1@example.com", "newsletter2@example.com", "alice.johnson@example.com", "tom.baker@example.com", "emily.chen@example.com", "sophie.martin@example.com", "priya.sharma@example.com", "rafael.oliveira@example.com", "chloe.taylor@example.com", "fatima.ali@example.com"];
  for (const email of newsletterEmails) {
    await prisma.newsletterSubscriber.upsert({ where: { email }, update: {}, create: { email, isActive: true } });
  }
  console.log("✓ Newsletter subscribers (10)");

  // ── Contact messages ───────────────────────────────────────────────────
  const contactMessages = [
    { name: "James Wright", email: "james.wright@example.com", subject: "General Enquiry", message: "Hello, I would like to know more about the services you offer and whether you have psychologists specialising in work-related stress. Thank you." },
    { name: "Laura Mendes", email: "laura.mendes@example.com", subject: "Booking Help", message: "I tried to book an appointment with Dr. Silva but couldn't find a suitable time slot. Could you help arrange something for next week?" },
    { name: "Peter Grant", email: "peter.grant@example.com", subject: "Psychologist Registration", message: "I am a licensed psychologist interested in joining your platform. Could you send information about the registration process?" },
    { name: "Sofia Nunes", email: "sofia.nunes@example.com", subject: "Insurance Coverage", message: "Do any of your psychologists accept health insurance? I have coverage through Médis and would like to know if sessions are reimbursable." },
    { name: "Antoine Bernard", email: "antoine.bernard@example.com", subject: "Online Sessions", message: "I'm based in France and interested in online therapy. Are online sessions available for clients outside Portugal?" },
    { name: "Clara Fonseca", email: "clara.fonseca@example.com", subject: "Couples Therapy", message: "My partner and I are looking for couples therapy. We'd prefer a therapist who works with both Portuguese and English speakers. Do you have availability?" },
    { name: "Miguel Santos", email: "miguel.santos@example.com", subject: "Child Assessment", message: "We are looking for a comprehensive psychological assessment for our 8-year-old son. Could you provide information on what this involves and the cost?" },
  ];
  for (const msg of contactMessages) {
    const exists = await prisma.contactMessage.findFirst({ where: { email: msg.email, subject: msg.subject } });
    if (!exists) await prisma.contactMessage.create({ data: msg });
  }
  console.log("✓ Contact messages (7)");

  console.log("\n🎉 Seed complete!\n");
  console.log("  Admin:         admin@psychpractice.com / Admin123#");
  console.log("  Psychologists: dr.sofia.andreou / dr.marco.ferreira / dr.ana.silva / ... (13 total) / Psych123#");
  console.log("  Clients:       alice.johnson / tom.baker / ... (23 total) / Client123#");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
