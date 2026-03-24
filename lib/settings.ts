import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { DEFAULT_SETTINGS, type SiteSettings } from "./settings-types";

export type { SiteSettings };
export { DEFAULT_SETTINGS };

export const getSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const rows = await prisma.siteSetting.findMany();
      const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      return { ...DEFAULT_SETTINGS, ...map } as SiteSettings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  ["site-settings"],
  { revalidate: 60, tags: ["site-settings"] }
);
