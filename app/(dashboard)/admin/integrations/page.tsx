import { redirect } from "next/navigation";

// Integrations are now part of Site Settings → Integrations tab
export default function AdminIntegrationsPage() {
  redirect("/admin/settings?tab=integrations");
}
