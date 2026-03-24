import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AdminLegalEditor from "@/components/dashboard/AdminLegalEditor";

export const metadata = { title: "Legal Pages | Admin" };

const LEGAL_KEYS = ["privacy", "cookies", "terms"] as const;

const LABELS: Record<string, string> = {
  privacy: "Privacy Policy",
  cookies: "Cookie Policy",
  terms: "Terms of Service",
};

export default async function AdminLegalPage() {
  await requireRole("ADMIN");

  const sections = await prisma.pageSection.findMany({
    where: { page: "legal" },
  });

  // Build a map: sectionKey → { id, content, title, updatedAt }
  const contentMap: Record<string, { id: string; content: string | null; title: string | null; updatedAt: Date }> = {};
  for (const s of sections) {
    contentMap[s.sectionKey] = { id: s.id, content: s.content, title: s.title, updatedAt: s.updatedAt };
  }

  const pages = LEGAL_KEYS.map((key) => ({
    key,
    label: LABELS[key],
    id: contentMap[key]?.id ?? null,
    content: contentMap[key]?.content ?? null,
    updatedAt: contentMap[key]?.updatedAt?.toISOString() ?? null,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Legal Pages</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit the content of your Privacy Policy, Cookie Policy, and Terms of Service.
          When custom content is saved, it replaces the default template on the public page.
          Leave a page empty to use the auto-generated template (based on your region setting in{" "}
          <a href="/admin/settings" className="text-blue-600 hover:underline">Site Settings</a>).
        </p>
      </div>

      <AdminLegalEditor pages={pages} />
    </div>
  );
}
