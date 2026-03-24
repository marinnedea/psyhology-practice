"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings-types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  initialSettings: SiteSettings;
  recaptchaSecretKey: string;
  smtpPassword: string;
  initialTab?: string;
};

type Tab = "branding" | "social" | "legal" | "integrations" | "email";
type SaveStatus = "idle" | "saving" | "saved" | "error";

// ── Shared helpers ────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pr-10 font-mono`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
        tabIndex={-1}
        aria-label={show ? "Hide" : "Show"}
      >
        {show ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

function StatusBadge({ configured }: { configured: boolean }) {
  return configured ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />Configured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 inline-block" />Not configured
    </span>
  );
}

async function saveSettings(data: Record<string, string>): Promise<void> {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save");
}

function SaveRow({
  onSave,
  status,
  label = "Save",
}: {
  onSave: () => void;
  status: SaveStatus;
  label?: string;
}) {
  return (
    <div className="pt-2 flex justify-end">
      <button
        type="button"
        onClick={onSave}
        disabled={status === "saving"}
        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
          status === "saved"
            ? "bg-green-600 text-white"
            : status === "error"
            ? "bg-red-600 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : status === "error" ? "Error — retry" : label}
      </button>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">{title}</h3>
      {children}
    </div>
  );
}

// ── Tab: Branding ─────────────────────────────────────────────────────────────

function BrandingTab({ values, setValues }: { values: SiteSettings; setValues: (v: SiteSettings) => void }) {
  const [status, setStatus] = useState<SaveStatus>("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      await saveSettings({
        site_name:       values.site_name,
        site_tagline:    values.site_tagline,
        site_description:values.site_description,
        footer_credits:  values.footer_credits,
        contact_email:   values.contact_email,
        contact_phone:   values.contact_phone,
      });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  function set(k: keyof SiteSettings) {
    return (v: string) => setValues({ ...values, [k]: v });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Card title="Site Identity">
        <Field label="Site Name"        value={values.site_name}        onChange={set("site_name")}        placeholder="Psychology Practice" />
        <Field label="Tagline"          value={values.site_tagline}     onChange={set("site_tagline")}     placeholder="Connecting minds, building bridges…" />
        <Field label="Meta Description" value={values.site_description} onChange={set("site_description")} placeholder="Used in search engine results" />
        <Field label="Footer Credits"   value={values.footer_credits}   onChange={set("footer_credits")}   placeholder="© 2025 Psychology Practice" />
      </Card>
      <Card title="Contact Details">
        <Field label="Contact Email" type="email" value={values.contact_email} onChange={set("contact_email")} placeholder="contact@example.com" />
        <Field label="Contact Phone" type="tel"   value={values.contact_phone} onChange={set("contact_phone")} placeholder="+1 (555) 000-0000" />
      </Card>
      <SaveRow onSave={handleSave} status={status} label="Save Branding" />
    </div>
  );
}

// ── Tab: Social Links ─────────────────────────────────────────────────────────

function SocialTab({ values, setValues }: { values: SiteSettings; setValues: (v: SiteSettings) => void }) {
  const [status, setStatus] = useState<SaveStatus>("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      await saveSettings({
        social_facebook:  values.social_facebook,
        social_instagram: values.social_instagram,
        social_twitter:   values.social_twitter,
      });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  function set(k: keyof SiteSettings) {
    return (v: string) => setValues({ ...values, [k]: v });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Card title="Social Profiles">
        <Field label="Facebook URL"   type="url" value={values.social_facebook}  onChange={set("social_facebook")}  placeholder="https://facebook.com/…" />
        <Field label="Instagram URL"  type="url" value={values.social_instagram} onChange={set("social_instagram")} placeholder="https://instagram.com/…" />
        <Field label="Twitter / X URL"type="url" value={values.social_twitter}   onChange={set("social_twitter")}   placeholder="https://x.com/…" />
      </Card>
      <SaveRow onSave={handleSave} status={status} label="Save Social Links" />
    </div>
  );
}

// ── Tab: Privacy & Legal ──────────────────────────────────────────────────────

function LegalTab({ values, setValues }: { values: SiteSettings; setValues: (v: SiteSettings) => void }) {
  const [status, setStatus] = useState<SaveStatus>("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      await saveSettings({
        privacy_region:        values.privacy_region,
        privacy_org_name:      values.privacy_org_name,
        privacy_org_address:   values.privacy_org_address,
        privacy_contact_email: values.privacy_contact_email,
        privacy_dpo_email:     values.privacy_dpo_email,
      });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Card title="Cookie & Privacy Consent">
        <div>
          <Label>Privacy Regulation Region</Label>
          <select
            value={values.privacy_region}
            onChange={(e) => setValues({ ...values, privacy_region: e.target.value })}
            className={inputCls}
          >
            <option value="EU">🇪🇺 European Union — GDPR (opt-in consent required)</option>
            <option value="US">🇺🇸 United States — CCPA / CPRA (opt-out model)</option>
            <option value="GLOBAL">🌐 Global — Generic privacy notice</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            EU: full consent banner before non-essential cookies. US: dismissible notice with opt-out. Global: simple acknowledgement.
          </p>
        </div>
      </Card>

      <Card title="Legal Entity Details">
        <div>
          <Label>Organisation Name</Label>
          <input type="text" value={values.privacy_org_name} onChange={(e) => setValues({ ...values, privacy_org_name: e.target.value })} placeholder="Psychology Practice Ltd." className={inputCls} />
        </div>
        <div>
          <Label>Registered Address</Label>
          <input type="text" value={values.privacy_org_address} onChange={(e) => setValues({ ...values, privacy_org_address: e.target.value })} placeholder="123 Main Street, City, Country" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Privacy Contact Email</Label>
            <input type="email" value={values.privacy_contact_email} onChange={(e) => setValues({ ...values, privacy_contact_email: e.target.value })} placeholder="privacy@example.com" className={inputCls} />
          </div>
          <div>
            <Label>DPO Email <span className="text-gray-400 font-normal">(EU only)</span></Label>
            <input type="email" value={values.privacy_dpo_email} onChange={(e) => setValues({ ...values, privacy_dpo_email: e.target.value })} placeholder="dpo@example.com" className={inputCls} />
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
          Always review legal pages with a qualified professional before going live.
        </div>
      </Card>

      <Card title="Generated Legal Pages">
        <div className="text-sm text-gray-600 space-y-1">
          <p><a href="/privacy" target="_blank" className="text-indigo-600 hover:underline">/privacy</a> — Privacy Policy</p>
          <p><a href="/cookies" target="_blank" className="text-indigo-600 hover:underline">/cookies</a> — Cookie Policy</p>
          <p><a href="/terms"   target="_blank" className="text-indigo-600 hover:underline">/terms</a>   — Terms of Service</p>
        </div>
        <p className="text-xs text-gray-400">Edit content at <a href="/admin/legal" className="text-indigo-600 hover:underline">Admin → Legal Pages</a></p>
      </Card>

      <SaveRow onSave={handleSave} status={status} label="Save Privacy & Legal" />
    </div>
  );
}

// ── Tab: Integrations ─────────────────────────────────────────────────────────

function IntegrationsTab({
  values,
  setValues,
  recaptchaSecretKey,
  setRecaptchaSecretKey,
}: {
  values: SiteSettings;
  setValues: (v: SiteSettings) => void;
  recaptchaSecretKey: string;
  setRecaptchaSecretKey: (v: string) => void;
}) {
  const [tinymceStatus, setTinymceStatus]       = useState<SaveStatus>("idle");
  const [recaptchaStatus, setRecaptchaStatus]   = useState<SaveStatus>("idle");
  const [gaStatus, setGaStatus]                 = useState<SaveStatus>("idle");
  const [unsplashStatus, setUnsplashStatus]     = useState<SaveStatus>("idle");

  function mkSave(fields: Record<string, string>, setStatus: (s: SaveStatus) => void) {
    return async () => {
      setStatus("saving");
      try {
        await saveSettings(fields);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2500);
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    };
  }

  return (
    <div className="space-y-5 max-w-2xl">

      {/* TinyMCE */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">TinyMCE Rich Text Editor</h3>
          <StatusBadge configured={values.tinymce_api_key.trim() !== ""} />
        </div>
        <div>
          <Label>API Key</Label>
          <PasswordInput
            id="tinymce_api_key"
            value={values.tinymce_api_key}
            onChange={(v) => setValues({ ...values, tinymce_api_key: v })}
            placeholder="Enter your TinyMCE API key"
          />
          <p className="text-xs text-gray-400 mt-1">
            Get your free key at <a href="https://www.tiny.cloud" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">tiny.cloud</a>
          </p>
        </div>
        <SaveRow onSave={mkSave({ tinymce_api_key: values.tinymce_api_key }, setTinymceStatus)} status={tinymceStatus} />
      </div>

      {/* reCAPTCHA */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Google reCAPTCHA v2</h3>
          <StatusBadge configured={values.recaptcha_site_key.trim() !== "" && recaptchaSecretKey.trim() !== ""} />
        </div>
        <div className="space-y-3">
          <div>
            <Label>Site Key</Label>
            <input id="recaptcha_site_key" type="text" value={values.recaptcha_site_key} onChange={(e) => setValues({ ...values, recaptcha_site_key: e.target.value })} placeholder="6Le..." className={`${inputCls} font-mono`} />
          </div>
          <div>
            <Label>Secret Key</Label>
            <PasswordInput id="recaptcha_secret_key" value={recaptchaSecretKey} onChange={setRecaptchaSecretKey} placeholder="6Le..." />
          </div>
          <p className="text-xs text-gray-400">
            Register at <a href="https://www.google.com/recaptcha" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">google.com/recaptcha</a>. When both keys are set a checkbox appears on the login form.
          </p>
        </div>
        <SaveRow onSave={mkSave({ recaptcha_site_key: values.recaptcha_site_key, recaptcha_secret_key: recaptchaSecretKey }, setRecaptchaStatus)} status={recaptchaStatus} />
      </div>

      {/* Google Analytics */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Google Analytics 4</h3>
          <StatusBadge configured={values.ga_measurement_id.trim() !== ""} />
        </div>
        <div>
          <Label>Measurement ID</Label>
          <input id="ga_measurement_id" type="text" value={values.ga_measurement_id} onChange={(e) => setValues({ ...values, ga_measurement_id: e.target.value })} placeholder="G-XXXXXXXXXX" className={`${inputCls} font-mono`} />
          <p className="text-xs text-gray-400 mt-1">Find this in your GA4 property settings under Data Streams.</p>
        </div>
        <SaveRow onSave={mkSave({ ga_measurement_id: values.ga_measurement_id }, setGaStatus)} status={gaStatus} />
      </div>

      {/* Unsplash */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Unsplash Image Search</h3>
          <StatusBadge configured={values.unsplash_access_key.trim() !== ""} />
        </div>
        <div>
          <Label>Access Key</Label>
          <PasswordInput id="unsplash_access_key" value={values.unsplash_access_key} onChange={(v) => setValues({ ...values, unsplash_access_key: v })} placeholder="Enter your Unsplash access key" />
          <p className="text-xs text-gray-400 mt-1">
            Register at <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">unsplash.com/developers</a>. Used for searching stock photos in the admin.
          </p>
        </div>
        <SaveRow onSave={mkSave({ unsplash_access_key: values.unsplash_access_key }, setUnsplashStatus)} status={unsplashStatus} />
      </div>

    </div>
  );
}

// ── Tab: Email & SMTP ─────────────────────────────────────────────────────────

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${value ? "bg-indigo-600" : "bg-gray-200"}`}
      >
        <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition ${value ? "translate-x-4" : "translate-x-0"}`} />
      </button>
      <span className={`text-sm font-medium ${value ? "text-indigo-700" : "text-gray-500"}`}>{label}</span>
    </div>
  );
}

function EmailTab({
  values,
  setValues,
  smtpPassword,
  setSmtpPassword,
}: {
  values: SiteSettings;
  setValues: (v: SiteSettings) => void;
  smtpPassword: string;
  setSmtpPassword: (v: string) => void;
}) {
  const [ticketStatus, setTicketStatus] = useState<SaveStatus>("idle");
  const [smtpStatus, setSmtpStatus]     = useState<SaveStatus>("idle");
  const [testStatus, setTestStatus]     = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [testError, setTestError]       = useState("");

  async function saveTicketing() {
    setTicketStatus("saving");
    try {
      await saveSettings({ ticketing_enabled: values.ticketing_enabled });
      setTicketStatus("saved");
      setTimeout(() => setTicketStatus("idle"), 2500);
    } catch {
      setTicketStatus("error");
      setTimeout(() => setTicketStatus("idle"), 3000);
    }
  }

  async function saveSmtp() {
    setSmtpStatus("saving");
    try {
      await saveSettings({
        smtp_enabled:    values.smtp_enabled,
        smtp_host:       values.smtp_host,
        smtp_port:       values.smtp_port,
        smtp_secure:     values.smtp_secure,
        smtp_user:       values.smtp_user,
        smtp_from_name:  values.smtp_from_name,
        smtp_from_email: values.smtp_from_email,
        smtp_password:   smtpPassword,
      });
      setSmtpStatus("saved");
      setTimeout(() => setSmtpStatus("idle"), 2500);
    } catch {
      setSmtpStatus("error");
      setTimeout(() => setSmtpStatus("idle"), 3000);
    }
  }

  async function testConnection() {
    setTestStatus("testing");
    setTestError("");
    try {
      const res = await fetch("/api/admin/smtp-test", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setTestStatus("ok");
      } else {
        setTestStatus("fail");
        setTestError(data.error ?? "Connection failed");
      }
    } catch {
      setTestStatus("fail");
      setTestError("Network error");
    }
    setTimeout(() => setTestStatus("idle"), 5000);
  }

  function set(k: keyof SiteSettings) {
    return (v: string) => setValues({ ...values, [k]: v });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Ticketing toggle */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Support Ticketing System</h3>
        <Toggle
          value={values.ticketing_enabled === "1"}
          onChange={(v) => setValues({ ...values, ticketing_enabled: v ? "1" : "0" })}
          label={values.ticketing_enabled === "1" ? "Ticketing enabled" : "Ticketing disabled"}
        />
        <p className="text-xs text-gray-400">
          When enabled, clients and psychologists can open support tickets via their dashboards. Admin can manage all tickets from the Inbox menu.
          Email notifications require SMTP to be configured and enabled below.
        </p>
        <SaveRow onSave={saveTicketing} status={ticketStatus} label="Save Ticketing Settings" />
      </div>

      {/* SMTP settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-sm font-semibold text-gray-900">SMTP Email Settings</h3>
          <StatusBadge configured={values.smtp_enabled === "1" && values.smtp_host.trim() !== ""} />
        </div>

        <Toggle
          value={values.smtp_enabled === "1"}
          onChange={(v) => setValues({ ...values, smtp_enabled: v ? "1" : "0" })}
          label={values.smtp_enabled === "1" ? "SMTP enabled" : "SMTP disabled"}
        />

        {values.smtp_enabled === "1" && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>SMTP Host</Label>
                <input type="text" value={values.smtp_host} onChange={(e) => set("smtp_host")(e.target.value)} placeholder="smtp.example.com" className={inputCls} />
              </div>
              <div>
                <Label>Port</Label>
                <input type="number" value={values.smtp_port} onChange={(e) => set("smtp_port")(e.target.value)} placeholder="587" className={inputCls} />
              </div>
              <div>
                <Label>Security</Label>
                <select value={values.smtp_secure} onChange={(e) => setValues({ ...values, smtp_secure: e.target.value })} className={inputCls}>
                  <option value="tls">STARTTLS (port 587)</option>
                  <option value="ssl">SSL/TLS (port 465)</option>
                  <option value="none">None (port 25)</option>
                </select>
              </div>
              <div>
                <Label>SMTP Username</Label>
                <input type="text" value={values.smtp_user} onChange={(e) => set("smtp_user")(e.target.value)} placeholder="user@example.com" className={inputCls} />
              </div>
              <div>
                <Label>SMTP Password</Label>
                <PasswordInput id="smtp_password" value={smtpPassword} onChange={setSmtpPassword} placeholder="••••••••" />
              </div>
              <div>
                <Label>From Name</Label>
                <input type="text" value={values.smtp_from_name} onChange={(e) => set("smtp_from_name")(e.target.value)} placeholder="Psychology Practice Support" className={inputCls} />
              </div>
              <div>
                <Label>From Email</Label>
                <input type="email" value={values.smtp_from_email} onChange={(e) => set("smtp_from_email")(e.target.value)} placeholder="support@example.com" className={inputCls} />
              </div>
            </div>

            {/* Test connection */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={testConnection}
                disabled={testStatus === "testing"}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {testStatus === "testing" ? "Testing…" : "Test Connection"}
              </button>
              {testStatus === "ok" && <span className="text-sm text-green-600 font-medium">✓ Connection successful</span>}
              {testStatus === "fail" && <span className="text-sm text-red-600">{testError || "Connection failed"}</span>}
            </div>
          </div>
        )}

        <SaveRow onSave={saveSmtp} status={smtpStatus} label="Save SMTP Settings" />
      </div>
    </div>
  );
}

// ── Main tabbed component ─────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "branding",      label: "Branding" },
  { id: "social",        label: "Social Links" },
  { id: "legal",         label: "Privacy & Legal" },
  { id: "integrations",  label: "Integrations" },
  { id: "email",         label: "Email & SMTP" },
];

export default function AdminSiteSettings({
  initialSettings,
  recaptchaSecretKey: initialRecaptchaSecretKey,
  smtpPassword: initialSmtpPassword,
  initialTab,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const t = initialTab as Tab | undefined;
    return TABS.some((x) => x.id === t) ? t! : "branding";
  });

  const [values, setValues] = useState<SiteSettings>(initialSettings);
  const [recaptchaSecretKey, setRecaptchaSecretKey] = useState(initialRecaptchaSecretKey);
  const [smtpPassword, setSmtpPassword] = useState(initialSmtpPassword);

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-1 flex-wrap" aria-label="Settings tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "branding"     && <BrandingTab      values={values} setValues={setValues} />}
      {activeTab === "social"       && <SocialTab        values={values} setValues={setValues} />}
      {activeTab === "legal"        && <LegalTab         values={values} setValues={setValues} />}
      {activeTab === "integrations" && (
        <IntegrationsTab
          values={values}
          setValues={setValues}
          recaptchaSecretKey={recaptchaSecretKey}
          setRecaptchaSecretKey={setRecaptchaSecretKey}
        />
      )}
      {activeTab === "email" && (
        <EmailTab
          values={values}
          setValues={setValues}
          smtpPassword={smtpPassword}
          setSmtpPassword={setSmtpPassword}
        />
      )}
    </div>
  );
}
