import type { NextConfig } from "next";

import path from "path";

const FIREBASE_HOST = "firebasestorage.googleapis.com";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: FIREBASE_HOST, pathname: "/v0/b/**" },
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/**" },
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
