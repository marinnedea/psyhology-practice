import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import { getSettings } from "@/lib/settings";
import AdminTicketQueue from "@/components/tickets/AdminTicketQueue";

export default async function AdminTicketsPage() {
  await requireRole("ADMIN");
  const settings = await getSettings();
  if (settings.ticketing_enabled !== "1") redirect("/admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage and respond to support requests from clients and psychologists.
        </p>
      </div>
      <AdminTicketQueue />
    </div>
  );
}
