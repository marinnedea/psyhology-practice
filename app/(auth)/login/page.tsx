import { getSettings } from "@/lib/settings";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const settings = await getSettings();
  return <LoginForm recaptchaSiteKey={settings.recaptcha_site_key} />;
}
