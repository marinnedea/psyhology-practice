import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AdminContactPageEditor from "@/components/dashboard/AdminContactPageEditor";

export default async function AdminContactPageEditorPage() {
  await requireRole("ADMIN");

  const sections = await prisma.pageSection.findMany({
    where: { page: "contact" },
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
        <h1 className="text-2xl font-bold text-gray-900">Contact Page</h1>
        <p className="text-gray-500 text-sm mt-1">
          Edit the text sections on the public <strong>/contact</strong> page.
        </p>
      </div>
      <AdminContactPageEditor initialSections={serialized} />
    </div>
  );
}
