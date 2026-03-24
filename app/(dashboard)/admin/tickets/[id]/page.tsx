import { redirect } from "next/navigation";
import { requireRole, getCurrentUser } from "@/lib/auth-helpers";
import { getSettings } from "@/lib/settings";
import AdminTicketDetail from "@/components/tickets/AdminTicketDetail";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  if (settings.ticketing_enabled !== "1") redirect("/admin");

  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ticket Detail</h1>
      </div>
      <AdminTicketDetail ticketId={id} adminId={user!.id} />
    </div>
  );
}
