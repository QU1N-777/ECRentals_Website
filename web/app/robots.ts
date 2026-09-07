import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ecrentals.co.za";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments stay out of the index until cutover.
  const isProd = process.env.VERCEL_ENV === "production";
  return {
    rules: isProd
      ? { userAgent: "*", allow: "/", disallow: ["/enquiry", "/enquiry/thank-you"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
