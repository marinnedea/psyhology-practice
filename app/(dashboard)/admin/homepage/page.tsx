import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AdminPageSectionsEditor from "@/components/dashboard/AdminPageSectionsEditor";

const KNOWN_HOMEPAGE_KEYS = [
  "hero",
  "stats",
  "features",
  "how_it_works",
  "services_preview",
  "testimonials",
  "team_preview",
  "blog_preview",
  "cta_banner",
];

export default async function AdminHomepagePage() {
  await requireRole("ADMIN");

  const sections = await prisma.pageSection.findMany({
    where: { page: "homepage" },
    orderBy: { sortOrder: "asc" },
  });

  const serialized = sections.map((s) => ({
    id: s.id,
    page: s.page,
    sectionKey: s.sectionKey,
    title: s.title,
    subtitle: s.subtitle,
    content: s.content,
    sortOrder: s.sortOrder,
    isVisible: s.isVisible,
    metadata: s.metadata as Record<string, unknown> | null,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
        <p className="text-gray-500 text-sm mt-1">
          Edit and configure each section of the homepage. Changes take effect immediately after saving.
        </p>
      </div>
      <AdminPageSectionsEditor
        initialSections={serialized}
        knownKeys={KNOWN_HOMEPAGE_KEYS}
      />
    </div>
  );
}
