import type {
    SubscriberArgs,
    SubscriberConfig,
} from "@medusajs/framework"
import { REVALIDATE_TAGS, revalidateStorefront } from "../lib/revalidate"

/**
 * Subscriber: inventory-revalidate
 *
 * Stock changes (admin editing a level, an order reserving units) do not emit
 * `product.updated`, so the storefront's cached product pages would keep
 * showing the old availability. Drop the products cache on any inventory move.
 */
export default async function inventoryRevalidateHandler(
    _args: SubscriberArgs<{ id: string }>,
) {
    await revalidateStorefront([REVALIDATE_TAGS.products])
}

export const config: SubscriberConfig = {
    event: [
        "inventory.inventory-level.created",
        "inventory.inventory-level.updated",
        "inventory.inventory-level.deleted",
        "inventory.reservation-item.created",
        "inventory.reservation-item.updated",
        "inventory.reservation-item.deleted",
    ],
}
