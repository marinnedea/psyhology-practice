import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AdminServicesManager from "@/components/dashboard/AdminServicesManager";
import AdminServiceSectionsEditor from "@/components/dashboard/AdminServiceSectionsEditor";

export const metadata = { title: "Services — Admin" };

export default async function AdminServicesPage() {
  await requireRole("ADMIN");

  const [services, dbSections] = await Promise.all([
    prisma.service.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.pageSection.findMany({
      where: { page: "services" },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const serializedServices = services.map((s) => ({
    ...s,
    price: s.price.toString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  const serializedSections = dbSections.map((s) => ({
    ...s,
    metadata: s.metadata as Record<string, unknown> | null,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-10 max-w-5xl">
      {/* ── Service records ── */}
      <div>
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            Manage individual services shown on the platform — price, duration, and visibility.
          </p>
        </div>
        <AdminServicesManager initialServices={serializedServices} />
      </div>

      {/* ── Page sections ── */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Services Page Sections</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            Control the hero, motto, how-we-work, why-us, for-companies, and CTA sections on the public /services page.
          </p>
        </div>
        <AdminServiceSectionsEditor initialSections={serializedSections} />
      </div>
    </div>
  );
}
