import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import AdminNewsletterManager from "@/components/dashboard/AdminNewsletterManager";

export default async function AdminNewsletterPage() {
  await requireRole("ADMIN");

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  const serialized = subscribers.map((s) => ({
    id: s.id,
    email: s.email,
    isActive: s.isActive,
    subscribedAt: s.subscribedAt.toISOString(),
    unsubscribedAt: s.unsubscribedAt?.toISOString() ?? null,
  }));

  const activeCount = serialized.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} active subscriber{activeCount !== 1 ? "s" : ""} out of {serialized.length} total.
          </p>
        </div>
      </div>
      <AdminNewsletterManager initialSubscribers={serialized} />
    </div>
  );
}
