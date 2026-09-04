import type { MetadataRoute } from "next";
import { getAllProductHandles } from "@/entities/product/server";
import { publicEnv } from "@/shared/config/env";

const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;

// Static pages change with a deploy, not with every crawl. Stamping them with
// `new Date()` told Google "changed just now" on every request, which makes
// `lastModified` worthless as a signal.
const STATIC_PAGES_LAST_MODIFIED = new Date("2026-06-22T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProductHandles();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: STATIC_PAGES_LAST_MODIFIED,
      priority: 1.0,
      changeFrequency: "daily",
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: STATIC_PAGES_LAST_MODIFIED,
      priority: 0.8,
      changeFrequency: "weekly",
    },
    {
      url: `${siteUrl}/reviews`,
      lastModified: STATIC_PAGES_LAST_MODIFIED,
      priority: 0.7,
      changeFrequency: "weekly",
    },
    {
      url: `${siteUrl}/about-us`,
      lastModified: STATIC_PAGES_LAST_MODIFIED,
      priority: 0.7,
      changeFrequency: "monthly",
    },
    {
      url: `${siteUrl}/contacts`,
      lastModified: STATIC_PAGES_LAST_MODIFIED,
      priority: 0.7,
      changeFrequency: "monthly",
    },
    {
      url: `${siteUrl}/payment-and-shipping`,
      lastModified: STATIC_PAGES_LAST_MODIFIED,
      priority: 0.5,
      changeFrequency: "monthly",
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: STATIC_PAGES_LAST_MODIFIED,
      priority: 0.3,
      changeFrequency: "yearly",
    },
    {
      url: `${siteUrl}/offer-agreement`,
      lastModified: STATIC_PAGES_LAST_MODIFIED,
      priority: 0.3,
      changeFrequency: "yearly",
    },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/product/${product.handle}`,
    lastModified: product.updatedAt ?? STATIC_PAGES_LAST_MODIFIED,
    priority: 0.9,
    changeFrequency: "weekly" as const,
  }));

  return [...staticPages, ...productPages];
}
