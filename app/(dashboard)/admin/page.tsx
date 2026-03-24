import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminDashboard() {
  await requireRole("ADMIN");

  const [
    totalUsers,
    adminCount,
    psychologistCount,
    clientCount,
    pendingApprovals,
    unreadMessages,
    newsletterSubscribers,
    recentMessages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "PSYCHOLOGIST" } }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "PSYCHOLOGIST", isApproved: false } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const statCards = [
    {
      label: "Total Users",
      value: totalUsers,
      color: "text-blue-600",
      sub: `${adminCount} admin · ${psychologistCount} psychologists · ${clientCount} clients`,
    },
    {
      label: "Pending Approvals",
      value: pendingApprovals,
      color: pendingApprovals > 0 ? "text-orange-500" : "text-gray-400",
      sub: "Psychologists awaiting approval",
    },
    {
      label: "Unread Messages",
      value: unreadMessages,
      color: unreadMessages > 0 ? "text-red-500" : "text-gray-400",
      sub: "Contact form submissions",
    },
    {
      label: "Newsletter Subscribers",
      value: newsletterSubscribers,
      color: "text-green-600",
      sub: "Active subscribers",
    },
  ];

  const quickLinks = [
    { href: "/admin/users", label: "Manage Users" },
    { href: "/admin/users?role=PSYCHOLOGIST&approved=false", label: "Review Pending Psychologists" },
    { href: "/admin/services", label: "Manage Services" },
    { href: "/admin/blog-categories", label: "Blog Categories" },
    { href: "/admin/homepage", label: "Edit Homepage Sections" },
    { href: "/admin/newsletter", label: "Newsletter Subscribers" },
    { href: "/admin/contact", label: "Contact Messages" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Platform overview and quick actions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>
              {card.value}
            </p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent contact messages */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Contact Messages</h2>
          <Link
            href="/admin/contact"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {recentMessages.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No contact messages yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`px-5 py-4 flex items-start gap-4 ${
                  !msg.isRead ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {msg.name}
                    </span>
                    <span className="text-gray-400 text-xs">{msg.email}</span>
                    {!msg.isRead && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                        Unread
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">
                    {msg.subject ?? "(no subject)"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {msg.message.slice(0, 120)}
                    {msg.message.length > 120 ? "…" : ""}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(msg.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
