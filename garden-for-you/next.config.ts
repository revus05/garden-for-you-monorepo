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
