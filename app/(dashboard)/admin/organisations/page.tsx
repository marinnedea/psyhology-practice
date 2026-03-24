import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AdminOrganisationsPageEditor from "@/components/dashboard/AdminOrganisationsPageEditor";

export const metadata = { title: "Organisations Page — Admin" };

export default async function AdminOrganisationsPage() {
  await requireRole("ADMIN");

  const dbSections = await prisma.pageSection.findMany({
    where: { page: "services_organisations" },
    orderBy: { sortOrder: "asc" },
  });

  const serializedSections = dbSections.map((s) => ({
    ...s,
    metadata: s.metadata as Record<string, unknown> | null,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organisations Page</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          Manage the content of the public{" "}
          <a href="/services/organisations" target="_blank" className="text-indigo-600 hover:underline">
            /services/organisations
          </a>{" "}
          page — hero, introduction, services list, why partner, and CTA sections.
        </p>
      </div>
      <AdminOrganisationsPageEditor initialSections={serializedSections} />
    </div>
  );
}
