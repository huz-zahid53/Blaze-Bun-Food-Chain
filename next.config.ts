import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },

  /* Cache Components off: keeps every page fully dynamic & predictable
     for the client-heavy ordering flow. */
  cacheComponents: false,

  /* Allow the Arena live-preview host to talk to the dev server. */
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai"],

  images: {
    formats: ["image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
  },

  /**
   * In development nothing may be cached. A stale HTML document or chunk is
   * what produces "hydration failed" errors that no longer correspond to the
   * source on disk, which sends you debugging a bug that does not exist.
   * Production keeps Next's default immutable caching for hashed assets.
   */
  async headers() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/((?!media/).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
