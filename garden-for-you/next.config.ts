import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
