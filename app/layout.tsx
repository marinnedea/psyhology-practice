import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SiteSettingsProvider } from "./providers";
import { getSettings } from "@/lib/settings";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.site_name || "Psychology Practice";

  const icons: Metadata["icons"] = {};
  if (settings.favicon_url) {
    icons.icon = [
      { url: settings.favicon_url, type: "image/png", sizes: "32x32" },
      ...(settings.favicon_2x_url
        ? [{ url: settings.favicon_2x_url, type: "image/png", sizes: "64x64" }]
        : []),
    ];
  }
  if (settings.apple_touch_icon_url) {
    icons.apple = [{ url: settings.apple_touch_icon_url, sizes: "180x180", type: "image/png" }];
  }

  return {
    title: { template: `%s | ${siteName}`, default: siteName },
    description: settings.site_description,
    ...(Object.keys(icons).length ? { icons } : {}),
  };
}

// Inline script to apply dark class before first paint (prevents flash)
const themeInitScript = `
try {
  var t = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (t === 'dark' || (!t && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
} catch(e) {}
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${geist.variable} font-sans antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <ThemeProvider>
          <SiteSettingsProvider settings={settings}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
            >
              Skip to main content
            </a>
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
            <CookieBanner />
          </SiteSettingsProvider>
        </ThemeProvider>
        {settings.ga_measurement_id ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga_measurement_id}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.ga_measurement_id}');
            `}</Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
