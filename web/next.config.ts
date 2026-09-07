import type { NextConfig } from "next";

const SUPABASE_HOST = "gblryijimeedzyyjnksd.supabase.co";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: SUPABASE_HOST, pathname: "/storage/v1/object/public/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // Preserve link equity from the WordPress site (plan §2.4).
    return [
      { source: "/services", destination: "/equipment", permanent: true },
      { source: "/quote", destination: "/enquiry", permanent: true },
      { source: "/gallery", destination: "/projects", permanent: true },
    ];
  },
};

export default nextConfig;
