import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MindBridge collects, uses, and protects your personal data.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{title}</h2>
      <div className="space-y-3 text-gray-700 leading-relaxed text-sm">{children}</div>
    </section>
  );
}

function GdprPolicy({ org, address, email, dpo, siteName }: {
  org: string; address: string; email: string; dpo: string; siteName: string;
}) {
  const updated = "16 March 2025";
  return (
    <>
      <Section title="1. Who We Are">
        <p>
          <strong>{org || siteName}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is the data controller
          responsible for your personal data. We operate the {siteName} platform, which connects clients with
          qualified mental health professionals.
        </p>
        {address && <p><strong>Registered address:</strong> {address}</p>}
        {email && <p><strong>Privacy contact:</strong> <a href={`mailto:${email}`} className="text-indigo-600 hover:underline">{email}</a></p>}
        {dpo && <p><strong>Data Protection Officer:</strong> <a href={`mailto:${dpo}`} className="text-indigo-600 hover:underline">{dpo}</a></p>}
      </Section>

      <Section title="2. What Data We Collect">
        <p>We collect and process the following categories of personal data:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Account data:</strong> name, email address, password (hashed), role</li>
          <li><strong>Profile data (psychologists):</strong> professional qualifications, biography, specialties, location, social links, profile photo</li>
          <li><strong>Appointment data:</strong> booking dates and times, service type, appointment status</li>
          <li><strong>Communication data:</strong> messages sent via our contact form</li>
          <li><strong>Newsletter data:</strong> email address (if you subscribe)</li>
          <li><strong>Usage data:</strong> pages visited, browser type, IP address, cookies (see our <Link href="/cookies" className="text-indigo-600 hover:underline">Cookie Policy</Link>)</li>
          <li><strong>Special category data:</strong> where you voluntarily disclose mental health information in the context of booking or communication, this is processed only with your explicit consent</li>
        </ul>
      </Section>

      <Section title="3. Legal Basis for Processing">
        <p>Under the GDPR, we process your personal data on the following legal bases:</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li><strong>Contract performance (Art. 6(1)(b)):</strong> to create and manage your account, process bookings, and deliver our services</li>
          <li><strong>Legitimate interests (Art. 6(1)(f)):</strong> to improve our platform, prevent fraud, and ensure security</li>
          <li><strong>Consent (Art. 6(1)(a)):</strong> for marketing emails, analytics cookies, and special category health data</li>
          <li><strong>Legal obligation (Art. 6(1)(c)):</strong> where required by applicable law</li>
        </ul>
        <p>For special category health data, we rely on your <strong>explicit consent</strong> (Art. 9(2)(a) GDPR).</p>
      </Section>

      <Section title="4. How We Use Your Data">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Providing and maintaining your account and appointments</li>
          <li>Enabling psychologists to manage their profiles and availability</li>
          <li>Processing and confirming bookings</li>
          <li>Sending appointment reminders and platform notifications</li>
          <li>Sending our newsletter (only with your consent; unsubscribe at any time)</li>
          <li>Improving platform functionality and user experience</li>
          <li>Complying with legal and regulatory obligations</li>
        </ul>
      </Section>

      <Section title="5. Data Retention">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Account data:</strong> retained for as long as your account is active, plus 2 years after deletion for legal purposes</li>
          <li><strong>Appointment records:</strong> 7 years for compliance and dispute resolution</li>
          <li><strong>Contact messages:</strong> 2 years</li>
          <li><strong>Newsletter subscriptions:</strong> until you unsubscribe</li>
          <li><strong>Analytics data:</strong> aggregated and anonymised after 26 months</li>
        </ul>
      </Section>

      <Section title="6. Who We Share Your Data With">
        <p>We do not sell your personal data. We may share it with:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Psychologists on our platform:</strong> only the information necessary to manage your appointment</li>
          <li><strong>Hosting and infrastructure providers:</strong> our servers are hosted in the EU / EEA</li>
          <li><strong>Analytics providers:</strong> Google Analytics (if enabled), with IP anonymisation</li>
          <li><strong>Payment processors:</strong> if applicable, processed under their own privacy policies</li>
          <li><strong>Law enforcement or regulators:</strong> where legally required</li>
        </ul>
      </Section>

      <Section title="7. International Transfers">
        <p>
          Where we transfer data outside the EU/EEA, we ensure appropriate safeguards are in place (such as Standard
          Contractual Clauses approved by the European Commission). Your data is primarily processed within the EU/EEA.
        </p>
      </Section>

      <Section title="8. Your Rights Under GDPR">
        <p>You have the following rights regarding your personal data:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Right of access</strong> — request a copy of the data we hold about you</li>
          <li><strong>Right to rectification</strong> — request corrections to inaccurate data</li>
          <li><strong>Right to erasure</strong> — request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
          <li><strong>Right to restrict processing</strong> — request that we limit how we use your data</li>
          <li><strong>Right to data portability</strong> — receive your data in a structured, machine-readable format</li>
          <li><strong>Right to object</strong> — object to processing based on legitimate interests or for direct marketing</li>
          <li><strong>Rights related to automated decision-making</strong> — we do not use automated decision-making with legal effect</li>
          <li><strong>Right to withdraw consent</strong> — where processing is based on consent, you may withdraw it at any time</li>
        </ul>
        <p>
          To exercise your rights, contact us at{" "}
          <a href={`mailto:${email || "privacy@example.com"}`} className="text-indigo-600 hover:underline">
            {email || "privacy@example.com"}
          </a>
          . We will respond within 30 days. You also have the right to lodge a complaint with your national data
          protection authority.
        </p>
      </Section>

      <Section title="9. Cookies">
        <p>
          We use cookies and similar tracking technologies. For full details, please see our{" "}
          <Link href="/cookies" className="text-indigo-600 hover:underline">Cookie Policy</Link>.
          You can manage your cookie preferences at any time via the cookie settings link in the footer.
        </p>
      </Section>

      <Section title="10. Security">
        <p>
          We implement appropriate technical and organisational measures to protect your personal data against
          unauthorised access, loss, or destruction. These include encrypted storage of passwords, HTTPS encryption
          in transit, and access controls. However, no internet transmission is completely secure.
        </p>
      </Section>

      <Section title="11. Changes to This Policy">
        <p>
          We may update this policy from time to time. We will notify you of significant changes by email or a
          prominent notice on our platform. The date at the top of this page shows when it was last updated.
        </p>
      </Section>

      <Section title="12. Contact Us">
        <p>For any privacy-related questions or requests:</p>
        {email && <p><strong>Email:</strong> <a href={`mailto:${email}`} className="text-indigo-600 hover:underline">{email}</a></p>}
        {dpo && <p><strong>DPO:</strong> <a href={`mailto:${dpo}`} className="text-indigo-600 hover:underline">{dpo}</a></p>}
        {address && <p><strong>Post:</strong> {address}</p>}
        <p className="mt-4 text-xs text-gray-400">Last updated: {updated}</p>
      </Section>
    </>
  );
}

function CcpaPolicy({ org, address, email, siteName }: {
  org: string; address: string; email: string; siteName: string;
}) {
  const updated = "16 March 2025";
  return (
    <>
      <Section title="1. Introduction">
        <p>
          <strong>{org || siteName}</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates the {siteName}
          platform. This Privacy Policy describes how we collect, use, and disclose personal information and explains
          your rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA).
        </p>
        {address && <p><strong>Address:</strong> {address}</p>}
      </Section>

      <Section title="2. Personal Information We Collect">
        <p>In the past 12 months, we have collected the following categories of personal information:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-gray-200 rounded-lg mt-2">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Category</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Examples</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Collected?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ["Identifiers", "Name, email address, IP address", "Yes"],
                ["Personal Records", "Account profile, professional qualifications", "Yes"],
                ["Protected Characteristics", "Health/mental health information (voluntarily disclosed)", "Yes"],
                ["Internet Activity", "Browsing history on our site, cookies", "Yes"],
                ["Geolocation", "Approximate location (city level)", "Yes"],
                ["Professional Information", "Psychologist credentials, specialties", "Yes"],
                ["Inferences", "Preferences inferred from usage", "No"],
              ].map(([cat, ex, col]) => (
                <tr key={cat}>
                  <td className="px-3 py-2 font-medium text-gray-700">{cat}</td>
                  <td className="px-3 py-2 text-gray-500">{ex}</td>
                  <td className={`px-3 py-2 font-semibold ${col === "Yes" ? "text-green-700" : "text-gray-400"}`}>{col}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. Sources of Personal Information">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Directly from you when you create an account, book an appointment, or contact us</li>
          <li>Automatically from your device (cookies, IP address, browser information)</li>
          <li>From psychologists who add information to their professional profiles</li>
        </ul>
      </Section>

      <Section title="4. How We Use Personal Information">
        <p>We use personal information for the following business purposes:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Providing and maintaining our mental health platform services</li>
          <li>Processing appointment bookings and communications</li>
          <li>Sending service-related notifications and reminders</li>
          <li>Improving our platform and user experience</li>
          <li>Detecting security incidents and preventing fraud</li>
          <li>Complying with applicable laws and regulations</li>
        </ul>
      </Section>

      <Section title="5. Disclosure of Personal Information">
        <p>
          We do not sell personal information. In the past 12 months, we have disclosed personal information to
          the following categories of third parties for business purposes:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Cloud infrastructure and hosting providers</li>
          <li>Analytics service providers (Google Analytics)</li>
          <li>Psychologists on our platform (appointment-related information only)</li>
        </ul>
      </Section>

      <Section title="6. Your California Privacy Rights">
        <p>California residents have the following rights under the CCPA/CPRA:</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li><strong>Right to Know:</strong> you may request details about the personal information we have collected about you in the past 12 months</li>
          <li><strong>Right to Delete:</strong> you may request that we delete your personal information, subject to certain exceptions</li>
          <li><strong>Right to Correct:</strong> you may request correction of inaccurate personal information</li>
          <li><strong>Right to Opt-Out of Sale/Sharing:</strong> we do not sell or share your personal information for cross-context behavioural advertising</li>
          <li><strong>Right to Limit Use of Sensitive Personal Information:</strong> you may request that we limit our use of sensitive personal information</li>
          <li><strong>Right to Non-Discrimination:</strong> we will not discriminate against you for exercising any of these rights</li>
        </ul>
        <p>
          To exercise your rights, contact us at{" "}
          <a href={`mailto:${email || "privacy@example.com"}`} className="text-indigo-600 hover:underline">
            {email || "privacy@example.com"}
          </a>
          . We will respond within 45 days.
        </p>
      </Section>

      <Section title="7. &ldquo;Do Not Sell or Share&rdquo; Notice">
        <p>
          We do not sell personal information as defined by the CCPA/CPRA. We do not share personal information
          for cross-context behavioural advertising. You may still use our{" "}
          <Link href="/cookies" className="text-indigo-600 hover:underline">cookie settings</Link> to opt out of analytics tracking.
        </p>
      </Section>

      <Section title="8. Cookies & Tracking">
        <p>
          We use cookies and similar technologies for essential platform functions and optional analytics.
          See our <Link href="/cookies" className="text-indigo-600 hover:underline">Cookie Policy</Link> for details
          and to manage your preferences.
        </p>
      </Section>

      <Section title="9. Data Retention">
        <p>
          We retain personal information for as long as necessary to fulfil the purposes described in this policy,
          or as required by law. Account data is retained for 2 years after account deletion. Appointment records
          are retained for 7 years.
        </p>
      </Section>

      <Section title="10. Security">
        <p>
          We use industry-standard security measures including encryption at rest and in transit, access controls,
          and regular security reviews to protect your personal information.
        </p>
      </Section>

      <Section title="11. Children's Privacy">
        <p>
          Our platform is not intended for individuals under 18 years of age. We do not knowingly collect personal
          information from children. If you believe we have inadvertently collected information from a minor, please
          contact us immediately.
        </p>
      </Section>

      <Section title="12. Contact Us">
        <p>
          For privacy requests or questions:{" "}
          {email ? <a href={`mailto:${email}`} className="text-indigo-600 hover:underline">{email}</a> : "privacy@example.com"}
        </p>
        {address && <p><strong>Post:</strong> {address}</p>}
        <p className="mt-4 text-xs text-gray-400">Last updated: {updated}</p>
      </Section>
    </>
  );
}

function GlobalPolicy({ org, address, email, siteName }: {
  org: string; address: string; email: string; siteName: string;
}) {
  const updated = "16 March 2025";
  return (
    <>
      <Section title="1. Introduction">
        <p>
          <strong>{org || siteName}</strong> is committed to protecting your privacy. This policy explains what
          personal information we collect, how we use it, and your choices.
        </p>
        {address && <p><strong>Address:</strong> {address}</p>}
      </Section>

      <Section title="2. Information We Collect">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Account details: name, email, password (hashed)</li>
          <li>Profile information provided by psychologists</li>
          <li>Appointment and booking data</li>
          <li>Messages sent via our contact form</li>
          <li>Technical data: IP address, browser type, usage data, cookies</li>
        </ul>
      </Section>

      <Section title="3. How We Use It">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>To operate and improve our platform</li>
          <li>To manage your account and appointments</li>
          <li>To communicate with you about your bookings</li>
          <li>To send our newsletter (with your consent)</li>
          <li>To improve platform security and prevent abuse</li>
        </ul>
      </Section>

      <Section title="4. Sharing">
        <p>We do not sell your data. We share it only with:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Psychologists (appointment data only)</li>
          <li>Hosting and infrastructure providers</li>
          <li>Analytics providers (if applicable)</li>
          <li>Authorities when required by law</li>
        </ul>
      </Section>

      <Section title="5. Your Choices">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Access, correct, or delete your account data from your profile settings</li>
          <li>Unsubscribe from our newsletter at any time</li>
          <li>Manage cookie preferences via our <Link href="/cookies" className="text-indigo-600 hover:underline">Cookie Policy</Link></li>
          <li>Contact us to request a copy of your data or its deletion</li>
        </ul>
      </Section>

      <Section title="6. Security & Retention">
        <p>
          We use encryption and secure storage to protect your data. We retain data only as long as needed
          to provide our services or comply with legal obligations.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          Questions about privacy? Email us:{" "}
          {email ? <a href={`mailto:${email}`} className="text-indigo-600 hover:underline">{email}</a> : "privacy@example.com"}
        </p>
        <p className="mt-4 text-xs text-gray-400">Last updated: {updated}</p>
      </Section>
    </>
  );
}

export default async function PrivacyPage() {
  const [s, customSection] = await Promise.all([
    getSettings(),
    prisma.pageSection.findFirst({ where: { page: "legal", sectionKey: "privacy" } }),
  ]);

  const region = s.privacy_region || "EU";
  const org = s.privacy_org_name || s.site_name;
  const email = s.privacy_contact_email || s.contact_email;

  const regionLabel =
    region === "EU" ? "GDPR (EU)" :
    region === "US" ? "CCPA / CPRA (California)" :
    "Global Privacy Policy";

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50 py-16 px-4 border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">
            {customSection?.content ? "Privacy Policy" : regionLabel}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-600">
            How {org} collects, uses, and protects your personal data.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/cookies" className="text-sm text-indigo-600 hover:underline">Cookie Policy →</Link>
            <Link href="/terms" className="text-sm text-indigo-600 hover:underline">Terms of Service →</Link>
          </div>
        </div>
      </section>

      {/* Disclaimer banner — only shown when using the template */}
      {!customSection?.content && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-start gap-3 text-xs text-amber-800">
            <svg className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              <strong>For information purposes only.</strong> This privacy policy template is provided as a starting point.
              It should be reviewed and customised by a qualified legal professional before being used on a live platform.
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {customSection?.content ? (
            /* Custom content from the admin editor */
            <div
              className="prose prose-gray max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: customSection.content }}
            />
          ) : (
            /* Auto-generated template */
            <>
              {region === "EU" && (
                <GdprPolicy
                  org={org}
                  address={s.privacy_org_address}
                  email={email}
                  dpo={s.privacy_dpo_email}
                  siteName={s.site_name}
                />
              )}
              {region === "US" && (
                <CcpaPolicy
                  org={org}
                  address={s.privacy_org_address}
                  email={email}
                  siteName={s.site_name}
                />
              )}
              {(region === "GLOBAL" || (!region)) && (
                <GlobalPolicy
                  org={org}
                  address={s.privacy_org_address}
                  email={email}
                  siteName={s.site_name}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
