import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AdminNewsletterManager from "@/components/dashboard/AdminNewsletterManager";

const PAGE_SIZE = 50;

type SearchParams = Promise<{ page?: string }>;

export default async function AdminNewsletterPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole("ADMIN");

  const { page: pageParam } = await searchParams;
  const page = Math.max(0, parseInt(pageParam ?? "0", 10) || 0);

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
    }),
    prisma.newsletterSubscriber.count(),
  ]);

  const serialized = subscribers.map((s) => ({
    id: s.id,
    email: s.email,
    isActive: s.isActive,
    subscribedAt: s.subscribedAt.toISOString(),
    unsubscribedAt: s.unsubscribedAt?.toISOString() ?? null,
  }));

  const activeCount = await prisma.newsletterSubscriber.count({ where: { isActive: true } });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} active subscriber{activeCount !== 1 ? "s" : ""} out of {total} total.
          </p>
        </div>
      </div>
      <AdminNewsletterManager
        initialSubscribers={serialized}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
}
