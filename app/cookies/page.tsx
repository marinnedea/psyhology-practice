import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Psychology Practice uses cookies and similar tracking technologies.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{title}</h2>
      <div className="space-y-3 text-gray-700 leading-relaxed text-sm">{children}</div>
    </section>
  );
}

type CookieRow = { name: string; purpose: string; duration: string; essential: boolean };

const COOKIE_TABLE: CookieRow[] = [
  { name: "session_token / auth_token", purpose: "Keeps you logged in to your account", duration: "Session / 30 days", essential: true },
  { name: "csrf_token", purpose: "Protects against cross-site request forgery attacks", duration: "Session", essential: true },
  { name: "cookie_consent", purpose: "Stores your cookie preference", duration: "1 year", essential: true },
  { name: "_ga, _ga_*", purpose: "Google Analytics — measures site usage and traffic", duration: "2 years", essential: false },
  { name: "_gid", purpose: "Google Analytics — distinguishes users", duration: "24 hours", essential: false },
  { name: "theme", purpose: "Remembers your display preferences (if applicable)", duration: "1 year", essential: false },
];

export default async function CookiesPage() {
  const [s, customSection] = await Promise.all([
    getSettings(),
    prisma.pageSection.findFirst({ where: { page: "legal", sectionKey: "cookies" } }),
  ]);
  const region = s.privacy_region || "EU";
  const siteName = s.site_name;
  const email = s.privacy_contact_email || s.contact_email;
  const isGdpr = region === "EU";
  const updated = "16 March 2025";

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50 py-16 px-4 border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">
            Legal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Cookie Policy</h1>
          <p className="text-gray-600">
            How {siteName} uses cookies and similar tracking technologies — and how to manage them.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/privacy" className="text-sm text-indigo-600 hover:underline">Privacy Policy →</Link>
            <Link href="/terms" className="text-sm text-indigo-600 hover:underline">Terms of Service →</Link>
          </div>
        </div>
      </section>

      {/* Manage banner */}
      <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-indigo-800">
            {isGdpr
              ? "Under GDPR, we ask for your consent before setting non-essential cookies."
              : "You can opt out of non-essential cookies at any time."}
          </p>
          <button
            id="open-cookie-settings"
            onClick={undefined}
            className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
            // Opens the cookie banner — handled by CookieBanner component via custom event
            data-action="open-cookie-settings"
          >
            Manage Cookie Preferences
          </button>
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

          <Section title="1. What Are Cookies?">
            <p>
              Cookies are small text files placed on your device when you visit a website. They help websites
              work properly, remember your preferences, and provide information to website owners about how
              visitors use their site.
            </p>
            <p>
              We also use similar technologies such as local storage and session storage for essential platform
              functions such as keeping you logged in.
            </p>
          </Section>

          <Section title="2. Types of Cookies We Use">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-lg mt-2">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600 w-48">Cookie Name</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Purpose</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600 w-28">Duration</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600 w-24">Essential?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {COOKIE_TABLE.map((row) => (
                    <tr key={row.name} className={row.essential ? "" : "bg-amber-50/40"}>
                      <td className="px-3 py-2 font-mono text-gray-700 break-all">{row.name}</td>
                      <td className="px-3 py-2 text-gray-600">{row.purpose}</td>
                      <td className="px-3 py-2 text-gray-500">{row.duration}</td>
                      <td className="px-3 py-2">
                        {row.essential
                          ? <span className="inline-block bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Yes</span>
                          : <span className="inline-block bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Optional</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="3. Essential Cookies">
            <p>
              Essential cookies are strictly necessary for the platform to function. Without them you would
              not be able to log in, book appointments, or use core platform features. These cookies do not
              require your consent and cannot be disabled.
            </p>
          </Section>

          <Section title="4. Analytics & Performance Cookies">
            <p>
              We use Google Analytics to understand how visitors interact with our platform. This helps us
              improve the user experience. Analytics cookies are only placed{" "}
              {isGdpr ? "after you give your consent" : "unless you choose to opt out"}.
            </p>
            <p>
              Analytics data is anonymised (IP addresses are truncated) and aggregated. It is not used to
              identify individual users. You can also opt out of Google Analytics globally via{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Google&apos;s opt-out browser add-on
              </a>.
            </p>
          </Section>

          <Section title={`5. Your ${isGdpr ? "Rights & Choices" : "Opt-Out Options"}`}>
            {isGdpr ? (
              <>
                <p>Under GDPR, we require your consent before placing non-essential cookies. You can:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Accept all cookies (essential + analytics)</li>
                  <li>Accept essential cookies only</li>
                  <li>Change your preference at any time via the cookie settings link in the footer</li>
                </ul>
                <p>
                  Your choice is stored for 12 months. After that, we will ask again. Refusing non-essential
                  cookies does not affect your ability to use the platform.
                </p>
              </>
            ) : (
              <>
                <p>You can opt out of non-essential cookies at any time:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Use the &ldquo;Manage Cookie Preferences&rdquo; button at the top of this page</li>
                  <li>Use your browser settings to block or delete cookies</li>
                  <li>Opt out of Google Analytics via the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">opt-out browser add-on</a></li>
                </ul>
                <p>Essential cookies cannot be disabled as they are required for the platform to function.</p>
              </>
            )}
          </Section>

          <Section title="6. Browser Cookie Controls">
            <p>
              Most browsers allow you to control cookies through their settings. Note that disabling cookies
              may affect your ability to use certain features of our platform. For guidance on managing
              cookies in your browser, visit:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              {[
                ["Chrome", "https://support.google.com/chrome/answer/95647"],
                ["Firefox", "https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox"],
                ["Safari", "https://support.apple.com/guide/safari/manage-cookies-sfri11471"],
                ["Edge", "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406"],
              ].map(([browser, url]) => (
                <li key={browser}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{browser}</a>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="7. Third-Party Services">
            <p>
              Some cookies on our platform are set by third-party services. These third parties have their
              own privacy policies:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Analytics Privacy Policy</a></li>
            </ul>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology or regulation.
              We will notify you of significant changes and re-ask for consent where required.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions about our use of cookies? Contact us at{" "}
              {email
                ? <a href={`mailto:${email}`} className="text-indigo-600 hover:underline">{email}</a>
                : "privacy@example.com"
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
