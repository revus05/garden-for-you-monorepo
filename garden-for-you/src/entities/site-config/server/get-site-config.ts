import "server-only";
import { publicEnv, resolveMedusaBaseUrl } from "@/shared/config/env";

const MEDUSA_BACKEND_URL = resolveMedusaBaseUrl();
const MEDUSA_PUBLISHABLE_KEY = publicEnv.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

export async function getSiteConfig(): Promise<Record<string, string>> {
    const url = `${MEDUSA_BACKEND_URL}/store/site-config`;

    const response = await fetch(url, {
        headers: {
            accept: "application/json",
            "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
        },
        next: { revalidate: 60 },
    });

    if (!response.ok) return {};

    const data = await response.json().catch(() => null);
    return data?.configs ?? {};
}
