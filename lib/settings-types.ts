export type SiteSettings = {
  site_name: string;
  site_tagline: string;
  site_description: string;
  footer_credits: string;
  contact_email: string;
  contact_phone: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  // Integration keys (public / client-safe)
  tinymce_api_key: string;
  recaptcha_site_key: string;
  ga_measurement_id: string;
  unsplash_access_key: string;
  // Legal / Privacy
  privacy_region: string; // "EU" | "US" | "GLOBAL"
  privacy_org_name: string; // Legal entity name for privacy policy
  privacy_org_address: string;
  privacy_contact_email: string;
  privacy_dpo_email: string; // EU: Data Protection Officer email
  // Ticketing / Email
  ticketing_enabled: string; // "1" | "0"
  // SMTP (smtp_password stored directly in DB, not cached)
  smtp_enabled: string; // "1" | "0"
  smtp_host: string;
  smtp_port: string;
  smtp_secure: string; // "tls" | "ssl" | "none"
  smtp_user: string;
  smtp_from_name: string;
  smtp_from_email: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "MindBridge",
  site_tagline: "Connecting minds, building bridges to better mental health",
  site_description:
    "Connect with qualified psychologists. Book appointments, read expert blog posts, and take care of your mental health.",
  footer_credits: "Built by MindBridge",
  contact_email: "",
  contact_phone: "",
  social_facebook: "",
  social_instagram: "",
  social_twitter: "",
  tinymce_api_key: "",
  recaptcha_site_key: "",
  ga_measurement_id: "",
  unsplash_access_key: "",
  privacy_region: "EU",
  privacy_org_name: "",
  privacy_org_address: "",
  privacy_contact_email: "",
  privacy_dpo_email: "",
  ticketing_enabled: "0",
  smtp_enabled: "0",
  smtp_host: "",
  smtp_port: "587",
  smtp_secure: "tls",
  smtp_user: "",
  smtp_from_name: "",
  smtp_from_email: "",
};
