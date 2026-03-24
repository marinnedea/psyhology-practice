import { getSettings } from "@/lib/settings";
import ContactPageClient from "@/components/contact/ContactPageClient";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with our team — individual enquiries or organisation wellbeing programmes.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  // Fallback is intentionally empty — configure via Admin → Settings → contact_email
  const contactEmail = settings.contact_email || "";

  return <ContactPageClient contactEmail={contactEmail} />;
}
