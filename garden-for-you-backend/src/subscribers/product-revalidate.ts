import type {
    SubscriberArgs,
    SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import {
    REVALIDATE_TAGS,
    productHandleTag,
    revalidateStorefront,
} from "../lib/revalidate"

export default async function productRevalidateHandler({
    event: { data, name },
    container,
}: SubscriberArgs<{ id: string }>) {
    const tags: string[] = [REVALIDATE_TAGS.products]

    // For create/update we can resolve the handle for granular invalidation.
    // For delete the product may already be gone, so we skip it and rely on global tag.
    if (name !== "product.deleted") {
        try {
            const productModule = container.resolve(Modules.PRODUCT)
            const product = await productModule.retrieveProduct(data.id, {
                select: ["handle"],
            })
            if (product?.handle) {
                tags.push(productHandleTag(product.handle))
            }
        } catch {
            // product not found — global "products" tag is enough
        }
    }

    await revalidateStorefront(tags)
}

export const config: SubscriberConfig = {
    event: ["product.updated", "product.created", "product.deleted"],
}
