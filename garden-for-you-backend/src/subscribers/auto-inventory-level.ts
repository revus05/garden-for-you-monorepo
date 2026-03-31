import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Subscriber: auto-inventory-level
 *
 * When a new product variant is created, automatically creates an inventory
 * level for it in the first available stock location with stocked_quantity = 0.
 * This way the admin only needs to update the number — no manual warehouse
 * setup is required.
 */
export default async function autoCreateInventoryLevel({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const variantId = data?.id
  if (!variantId) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService: any = container.resolve(Modules.INVENTORY)
  const stockLocationService: any = container.resolve(Modules.STOCK_LOCATION)

  // Give Medusa time to create & link the inventory item for the variant
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Query the link table directly by its registered alias — more reliable than
  // traversing from product_variant via inventory_items.inventory_item_id
  const { data: inventoryLinks } = await query.graph({
    entity: "product_variant_inventory_item",
    fields: ["inventory_item_id", "variant_id"],
    filters: { variant_id: variantId },
  })

  if (!inventoryLinks?.length) {
    logger.warn(`[auto-inventory] No inventory item link found for variant ${variantId}`)
    return
  }

  const inventoryItemId = inventoryLinks[0].inventory_item_id
  if (!inventoryItemId) return

  const [location] = await stockLocationService.listStockLocations({}, { take: 1 })
  if (!location) {
    logger.warn("[auto-inventory] No stock location found — run `npm run seed` first")
    return
  }

  const existingLevels = await inventoryService.listInventoryLevels({
    inventory_item_id: inventoryItemId,
    location_id: location.id,
  })

  if (existingLevels.length > 0) return

  await inventoryService.createInventoryLevels([{
    inventory_item_id: inventoryItemId,
    location_id: location.id,
    stocked_quantity: 0,
  }])

  logger.info(`[auto-inventory] Created inventory level for variant ${variantId} at location ${location.id}`)
}

export const config: SubscriberConfig = {
  event: ["product-variant.created"],
}
