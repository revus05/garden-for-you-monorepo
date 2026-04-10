import type { MetadataRoute } from "next";
import { getAllProductHandles } from "@/entities/product/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saddlyavas.by";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const handles = await getAllProductHandles();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      priority: 1.0,
      changeFrequency: "daily",
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "weekly",
    },
    {
      url: `${siteUrl}/reviews`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "weekly",
    },
    {
      url: `${siteUrl}/about-us`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "monthly",
    },
    {
      url: `${siteUrl}/contacts`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "monthly",
    },
    {
      url: `${siteUrl}/payment-and-shipping`,
      lastModified: new Date(),
      priority: 0.5,
      changeFrequency: "monthly",
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: new Date(),
      priority: 0.3,
      changeFrequency: "yearly",
    },
    {
      url: `${siteUrl}/offer-agreement`,
      lastModified: new Date(),
      priority: 0.3,
      changeFrequency: "yearly",
    },
  ];

  const productPages: MetadataRoute.Sitemap = handles.map((handle) => ({
    url: `${siteUrl}/product/${handle}`,
    lastModified: new Date(),
    priority: 0.9,
    changeFrequency: "weekly" as const,
  }));

  return [...staticPages, ...productPages];
}
