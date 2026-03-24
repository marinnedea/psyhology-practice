import { getSettings } from "@/lib/settings";
import ContactPageClient from "@/components/contact/ContactPageClient";

export const metadata = {
  title: "Contact Us | MindBridge",
  description: "Get in touch with our team — individual enquiries or organisation wellbeing programmes.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const contactEmail = settings.contact_email || "hello@mindbridge.com";

  return <ContactPageClient contactEmail={contactEmail} />;
}
