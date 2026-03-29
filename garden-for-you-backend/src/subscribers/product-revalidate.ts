import type {
    SubscriberArgs,
    SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function productRevalidateHandler({
    event: { data, name },
    container,
}: SubscriberArgs<{ id: string }>) {
    const tags = ["products"]

    // For create/update we can resolve the handle for granular invalidation.
    // For delete the product may already be gone, so we skip it and rely on global tag.
    if (name !== "product.deleted") {
        try {
            const productModule = container.resolve(Modules.PRODUCT)
            const product = await productModule.retrieveProduct(data.id, {
                select: ["handle"],
            })
            if (product?.handle) {
                tags.push(`product-handle-${product.handle}`)
            }
        } catch {
            // product not found — global "products" tag is enough
        }
    }

    await fetch(
        `${process.env.STOREFRONT_URL}/api/revalidate?tags=${tags.join(",")}`,
        {
            method: "GET",
            headers: {
                "x-revalidate-secret": process.env.REVALIDATE_SECRET ?? "",
            },
        },
    )
}

export const config: SubscriberConfig = {
    event: ["product.updated", "product.created", "product.deleted"],
}