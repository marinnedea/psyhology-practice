import { redirect } from "next/navigation";
import { requireRole, getCurrentUser } from "@/lib/auth-helpers";
import { getSettings } from "@/lib/settings";
import TicketThread from "@/components/tickets/TicketThread";

export default async function ClientTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("CLIENT");
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  if (settings.ticketing_enabled !== "1") redirect("/client");

  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Ticket</h1>
      </div>
      <TicketThread
        ticketId={id}
        currentUserId={user!.id}
        backPath="/client/support"
      />
    </div>
  );
}
