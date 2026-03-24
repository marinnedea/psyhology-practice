import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AdminAboutSectionsEditor from "@/components/dashboard/AdminAboutSectionsEditor";

export default async function AdminAboutPage() {
  await requireRole("ADMIN");

  const sections = await prisma.pageSection.findMany({
    where: { page: "about" },
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
        <h1 className="text-2xl font-bold text-gray-900">About Page</h1>
        <p className="text-gray-500 text-sm mt-1">
          Edit the sections displayed on the public <strong>/about</strong> page. Team members are pulled automatically from approved psychologist profiles.
        </p>
      </div>
      <AdminAboutSectionsEditor initialSections={serialized} />
    </div>
  );
}
