import "server-only";
import { medusaFetch } from "@/shared/api/medusa-fetch";
import { CACHE_TAGS } from "@/shared/cache";

export async function getSiteConfig(): Promise<Record<string, string>> {
    const response = await medusaFetch("/store/site-config", {
        next: { tags: [CACHE_TAGS.siteConfig], revalidate: 300 },
    });

    if (!response.ok) return {};

    const data = await response.json().catch(() => null);
    return data?.configs ?? {};
}
