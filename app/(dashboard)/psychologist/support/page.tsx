import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import { getSettings } from "@/lib/settings";
import TicketList from "@/components/tickets/TicketList";

export default async function PsychologistSupportPage() {
  await requireRole("PSYCHOLOGIST");
  const settings = await getSettings();
  if (settings.ticketing_enabled !== "1") redirect("/psychologist");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-500 text-sm mt-1">
          Need help? Submit a ticket and our team will get back to you.
        </p>
      </div>
      <TicketList basePath="/psychologist/support" />
    </div>
  );
}
