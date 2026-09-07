import type { MetadataRoute } from "next";
import { getCategories, getEquipment } from "@/lib/queries";
import { SERVICES, INDUSTRIES } from "@/lib/site-data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ecrentals.co.za";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, equipment] = await Promise.all([getCategories(), getEquipment()]);
  const now = new Date();

  const staticPages = [
    "", "/equipment", "/tools", "/services", "/industries",
    "/about", "/about/safety-compliance", "/about/team",
    "/projects", "/contact", "/privacy-policy", "/terms-of-hire",
  ];

  return [
    ...staticPages.map((p) => ({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...cats.map((c) => ({
      url: `${BASE}/equipment/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...equipment.map((e) => ({
      url: `${BASE}/equipment/item/${e.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...SERVICES.map((s) => ({
      url: `${BASE}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...INDUSTRIES.map((i) => ({
      url: `${BASE}/industries/${i.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
