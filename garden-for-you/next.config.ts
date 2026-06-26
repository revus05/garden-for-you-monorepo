import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client-side Router Cache reuse windows. Server-side caching + tag
  // invalidation keep data fresh, so a short client reuse window is safe and
  // makes back/forward and repeat navigation feel instant.
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  // Legacy URL redirects from the previous version of the site. The old
  // catalog lived at `/product_list`, which Google still has indexed and links
  // to from search results. After the rebuild the catalog moved to the home
  // page, so without these redirects those links 404 — losing both visitors
  // and the SEO weight the old URL had accumulated. A 301 (permanent) tells
  // Google to transfer ranking signals to the new URL and reindex it.
  async redirects() {
    return [
      {
        source: "/product_list",
        destination: "/",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Production Medusa backend — update hostname when deploying
      {
        protocol: "https",
        hostname: "**.saddlyavas.by",
      },
    ],
  },
};

export default nextConfig;
