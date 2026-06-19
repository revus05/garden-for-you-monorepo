import type { MetadataRoute } from "next";
import { publicEnv } from "@/shared/config/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/profile",
          "/compare",
          "/sign-in",
          "/sign-up",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
