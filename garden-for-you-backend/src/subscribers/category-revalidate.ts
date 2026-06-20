import type {
    SubscriberArgs,
    SubscriberConfig,
} from "@medusajs/framework"
import { REVALIDATE_TAGS, revalidateStorefront } from "../lib/revalidate"

export default async function categoryRevalidateHandler(
    _args: SubscriberArgs<{ id: string }>,
) {
    // Category structure feeds the cached catalog tree and category-filtered
    // product lists, so invalidate both tags.
    await revalidateStorefront([
        REVALIDATE_TAGS.categories,
        REVALIDATE_TAGS.products,
    ])
}

export const config: SubscriberConfig = {
    event: [
        "product-category.created",
        "product-category.updated",
        "product-category.deleted",
    ],
}
