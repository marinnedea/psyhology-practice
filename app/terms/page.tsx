import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing use of the MindBridge platform.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{title}</h2>
      <div className="space-y-3 text-gray-700 leading-relaxed text-sm">{children}</div>
    </section>
  );
}

export default async function TermsPage() {
  const [s, customSection] = await Promise.all([
    getSettings(),
    prisma.pageSection.findFirst({ where: { page: "legal", sectionKey: "terms" } }),
  ]);
  const siteName = s.site_name;
  const org = s.privacy_org_name || siteName;
  const email = s.privacy_contact_email || s.contact_email;
  const updated = "16 March 2025";

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50 py-16 px-4 border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">
            Legal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-gray-600">
            Please read these terms carefully before using the {siteName} platform.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/privacy" className="text-sm text-indigo-600 hover:underline">Privacy Policy →</Link>
            <Link href="/cookies" className="text-sm text-indigo-600 hover:underline">Cookie Policy →</Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-start gap-3 text-xs text-amber-800">
          <svg className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            <strong>For information purposes only.</strong> These terms of service are provided as a template
            and should be reviewed by a qualified legal professional before use on a live platform.
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">

          {customSection?.content ? (
            <div
              className="prose prose-gray max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: customSection.content }}
            />
          ) : (<>

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using the {siteName} platform (&ldquo;Platform&rdquo;, &ldquo;Service&rdquo;), you agree to be
              bound by these Terms of Service (&ldquo;Terms&rdquo;) and our{" "}
              <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>. If you do not
              agree to these Terms, you may not use our Service.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and <strong>{org}</strong>
              {s.privacy_org_address ? `, ${s.privacy_org_address}` : ""}
              {" "}(&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              {siteName} is an online platform that connects individuals seeking mental health support with
              qualified, registered psychologists and mental health professionals. The Platform facilitates:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Discovery and booking of mental health appointments</li>
              <li>Management of psychologist profiles and availability</li>
              <li>Publication and access to mental health articles and resources</li>
              <li>Secure communication between clients and professionals</li>
            </ul>
            <p className="font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mt-2">
              ⚠️ Important: {siteName} is not a medical service provider. We do not provide medical advice,
              diagnosis, or treatment. In a crisis or emergency, please contact emergency services immediately.
            </p>
          </Section>

          <Section title="3. User Accounts & Eligibility">
            <p>To use certain features, you must create an account. By doing so, you confirm that:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>You are at least 18 years of age</li>
              <li>All information you provide is accurate and current</li>
              <li>You will maintain the security of your account credentials</li>
              <li>You will notify us immediately of any unauthorised account access</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or that we
              reasonably believe may cause harm to other users or the Platform.
            </p>
          </Section>

          <Section title="4. Psychologist Registration">
            <p>
              Professionals registering as psychologists on the Platform agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Provide accurate information regarding qualifications, registration, and experience</li>
              <li>Maintain valid professional registration with the relevant regulatory body at all times</li>
              <li>Comply with applicable professional standards, ethics codes, and legal obligations</li>
              <li>Notify us immediately if their registration lapses or is suspended</li>
              <li>Not engage with clients on matters outside their professional competency</li>
            </ul>
            <p>
              New psychologist profiles are subject to admin approval and may be removed at our discretion
              if they are found to be inaccurate or if the professional is found to have violated these Terms.
            </p>
          </Section>

          <Section title="5. Appointments & Booking">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Appointment bookings are confirmed subject to psychologist availability</li>
              <li>Clients are responsible for attending scheduled appointments or providing adequate notice of cancellation</li>
              <li>Psychologists are responsible for managing their own availability and appointment obligations</li>
              <li>Payment terms (if applicable) are set by individual psychologists and agreed at the time of booking</li>
              <li>The Platform does not guarantee any specific therapeutic outcome</li>
            </ul>
          </Section>

          <Section title="6. User Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use the Platform for any unlawful purpose or in violation of applicable laws</li>
              <li>Impersonate any person or entity, or misrepresent your qualifications</li>
              <li>Upload or transmit content that is defamatory, abusive, or harmful</li>
              <li>Attempt to gain unauthorised access to any part of the Platform or other users&apos; accounts</li>
              <li>Engage in any activity that disrupts or interferes with the Platform or its servers</li>
              <li>Use automated tools (bots, scrapers) to access the Platform without our written permission</li>
              <li>Reproduce, sell, or distribute any content from the Platform without authorisation</li>
            </ul>
          </Section>

          <Section title="7. Content & Intellectual Property">
            <p>
              The Platform and its original content, features, and functionality are owned by {org} and
              are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              Psychologists retain ownership of their profile content but grant {siteName} a non-exclusive,
              worldwide licence to display it on the Platform. Blog posts published on the Platform are
              licensed for display on the Platform and may be indexed by search engines.
            </p>
            <p>
              The mental health articles published on our Blog are for informational purposes only and do
              not constitute medical or professional advice.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, {org} shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including but not limited to loss of profits,
              data, or goodwill, arising out of or in connection with:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your use of or inability to use the Platform</li>
              <li>Any therapeutic relationship or outcome between a client and a psychologist</li>
              <li>Any unauthorised access to or alteration of your data</li>
              <li>Any third-party content or conduct on the Platform</li>
            </ul>
            <p>
              Nothing in these Terms limits our liability for death or personal injury arising from our
              negligence, fraud, or any other liability that cannot be excluded by law.
            </p>
          </Section>

          <Section title="9. Indemnification">
            <p>
              You agree to indemnify and hold harmless {org}, its officers, directors, employees, and agents
              from any claims, liabilities, damages, or expenses (including legal fees) arising out of your
              use of the Platform, your violation of these Terms, or your infringement of any third-party rights.
            </p>
          </Section>

          <Section title="10. Third-Party Links & Services">
            <p>
              The Platform may contain links to third-party websites or services. We are not responsible for
              the content, privacy practices, or availability of any third-party sites. Accessing third-party
              links is at your own risk.
            </p>
          </Section>

          <Section title="11. Modifications to the Service & Terms">
            <p>
              We reserve the right to modify or discontinue the Platform at any time, with or without notice.
              We may update these Terms from time to time. Continued use of the Platform after changes
              constitutes acceptance of the revised Terms. We will notify registered users of material changes
              by email or prominent notice on the Platform.
            </p>
          </Section>

          <Section title="12. Termination">
            <p>
              We may suspend or terminate your account and access to the Platform at our sole discretion, without
              notice, for conduct that we believe violates these Terms or is harmful to other users, us, or
              third parties, or for any other reason.
            </p>
            <p>
              You may terminate your account at any time by contacting us. Upon termination, your right to
              use the Platform will immediately cease.
            </p>
          </Section>

          <Section title="13. Governing Law & Dispute Resolution">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
              in which {org} is registered, without regard to its conflict of law provisions.
            </p>
            <p>
              Any dispute arising under these Terms shall first be subject to good-faith negotiation.
              If unresolved, disputes shall be submitted to the competent courts of the jurisdiction in
              which {org} is registered.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              Questions about these Terms? Contact us at{" "}
              {email
                ? <a href={`mailto:${email}`} className="text-indigo-600 hover:underline">{email}</a>
                : "legal@example.com"
              }.
            </p>
            <p className="mt-4 text-xs text-gray-400">Last updated: {updated}</p>
          </Section>

          </>)}
        </div>
      </div>
    </div>
  );
}
