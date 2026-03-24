import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import AdminContactMessages from "@/components/dashboard/AdminContactMessages";

export default async function AdminContactPage() {
  await requireRole("ADMIN");

  const [messages, settings] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
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

  const unreadCount = serialized.filter((m) => !m.isRead).length;
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
      <AdminContactMessages initialMessages={serialized} smtpEnabled={smtpEnabled} />
    </div>
  );
}
