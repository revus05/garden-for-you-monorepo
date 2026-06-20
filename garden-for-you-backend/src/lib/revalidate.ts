/**
 * Storefront cache-tag invalidation helper.
 *
 * Pings the Next.js storefront `/api/revalidate` endpoint so it can drop the
 * data-cache entries tagged with the given tags. Fire-and-forget: failures are
 * swallowed so a mutation is never blocked or broken by an unreachable
 * storefront (the ISR `revalidate` window is the fallback).
 *
 * Tag strings mirror the storefront registry at `src/shared/cache/tags.ts`.
 */

export const REVALIDATE_TAGS = {
    products: "products",
    categories: "categories",
    siteConfig: "site-config",
    reviews: "store-reviews",
} as const

export const productHandleTag = (handle: string): string =>
    `product-handle-${handle}`

export async function revalidateStorefront(tags: string[]): Promise<void> {
    const storefrontUrl = process.env.STOREFRONT_URL
    if (!storefrontUrl || tags.length === 0) {
        return
    }

    try {
        await fetch(`${storefrontUrl}/api/revalidate?tags=${tags.join(",")}`, {
            method: "GET",
            headers: {
                "x-revalidate-secret": process.env.REVALIDATE_SECRET ?? "",
            },
        })
    } catch {
        // storefront unreachable — rely on ISR revalidate fallback
    }
}
