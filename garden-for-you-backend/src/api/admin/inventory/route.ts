import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * GET /admin/inventory
 * GET /admin/inventory?product_id=prod_xxx
 *
 * Returns all variants (optionally filtered by product_id) with their
 * stocked_quantity and reserved_quantity from the default stock location.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { product_id } = req.query as Record<string, string>

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService: any = req.scope.resolve(Modules.INVENTORY)

  const filters: Record<string, any> = {}
  if (product_id) filters.product_id = product_id

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "title",
      "sku",
      "product_id",
      "product.id",
      "product.title",
      "product.thumbnail",
      "inventory_items.inventory_item_id",
    ],
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    pagination: { skip: 0, take: 500 },
  })

  // Collect all inventory item IDs from all variants
  const inventoryItemIds: string[] = variants
    .flatMap((v: any) => v.inventory_items?.map((i: any) => i.inventory_item_id) ?? [])
    .filter(Boolean)

  // Fetch inventory levels for all collected IDs at once
  const levelsMap: Record<
    string,
    { stocked_quantity: number; reserved_quantity: number; location_id: string }
  > = {}

  if (inventoryItemIds.length > 0) {
    const levels = await inventoryService.listInventoryLevels({
      inventory_item_id: inventoryItemIds,
    })

    for (const level of levels) {
      const key = level.inventory_item_id
      if (!levelsMap[key]) {
        levelsMap[key] = {
          stocked_quantity: level.stocked_quantity ?? 0,
          reserved_quantity: level.reserved_quantity ?? 0,
          location_id: level.location_id,
        }
      } else {
        // Sum across multiple locations
        levelsMap[key].stocked_quantity += level.stocked_quantity ?? 0
        levelsMap[key].reserved_quantity += level.reserved_quantity ?? 0
      }
    }
  }

  const result = variants.map((variant: any) => {
    const inventoryItemId = variant.inventory_items?.[0]?.inventory_item_id ?? null
    const level = inventoryItemId ? (levelsMap[inventoryItemId] ?? null) : null
    return {
      id: variant.id,
      title: variant.title,
      sku: variant.sku ?? null,
      product_id: variant.product_id,
      product_title: variant.product?.title ?? null,
      product_thumbnail: variant.product?.thumbnail ?? null,
      inventory_item_id: inventoryItemId,
      stocked_quantity: level?.stocked_quantity ?? 0,
      reserved_quantity: level?.reserved_quantity ?? 0,
      location_id: level?.location_id ?? null,
    }
  })

  res.json({ variants: result })
}
