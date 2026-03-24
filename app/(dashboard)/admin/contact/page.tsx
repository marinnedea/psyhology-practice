import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import AdminContactMessages from "@/components/dashboard/AdminContactMessages";

const PAGE_SIZE = 20;

type SearchParams = Promise<{ page?: string }>;

export default async function AdminContactPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole("ADMIN");

  const { page: pageParam } = await searchParams;
  const page = Math.max(0, parseInt(pageParam ?? "0", 10) || 0);

  const [messages, total, settings] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
    }),
    prisma.contactMessage.count(),
    getSettings(),
  ]);

  const serialized = messages.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    isRead: m.isRead,
    repliedAt: m.repliedAt ? m.repliedAt.toISOString() : null,
    replyBody: m.replyBody ?? null,
    createdAt: m.createdAt.toISOString(),
  }));

  const unreadCount = await prisma.contactMessage.count({ where: { isRead: false } });
  const smtpEnabled = settings.smtp_enabled === "1";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-gray-500 text-sm mt-1">
          {unreadCount > 0
            ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
            : "All messages have been read."}
        </p>
      </div>
      <AdminContactMessages
        initialMessages={serialized}
        smtpEnabled={smtpEnabled}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
}
