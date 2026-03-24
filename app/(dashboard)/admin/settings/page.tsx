import { requireRole } from "@/lib/auth-helpers";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import AdminSiteSettings from "@/components/dashboard/AdminSiteSettings";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireRole("ADMIN");
  const { tab } = await searchParams;
  const settings = await getSettings();

  let recaptchaSecretKey = "";
  let smtpPassword = "";
  try {
    const [rcRow, smtpRow] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "recaptcha_secret_key" } }),
      prisma.siteSetting.findUnique({ where: { key: "smtp_password" } }),
    ]);
    recaptchaSecretKey = rcRow?.value ?? "";
    smtpPassword = smtpRow?.value ?? "";
  } catch {
    // DB unavailable
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h1>
      <AdminSiteSettings
        initialSettings={settings}
        recaptchaSecretKey={recaptchaSecretKey}
        smtpPassword={smtpPassword}
        initialTab={tab}
      />
    </div>
  );
}
