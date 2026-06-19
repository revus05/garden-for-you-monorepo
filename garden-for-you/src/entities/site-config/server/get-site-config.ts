import "server-only";
import { medusaFetch } from "@/shared/api/medusa-fetch";

export async function getSiteConfig(): Promise<Record<string, string>> {
    const response = await medusaFetch("/store/site-config", {
        next: { revalidate: 60 },
    });

    if (!response.ok) return {};

    const data = await response.json().catch(() => null);
    return data?.configs ?? {};
}
