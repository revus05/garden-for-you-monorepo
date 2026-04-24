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

  // Step 1: Fetch variants (with product info)
  const variantFilters: Record<string, any> = {}
  if (product_id) variantFilters.product_id = product_id

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
      "options.value",
      "options.option.title",
      "prices.id",
      "prices.amount",
      "prices.currency_code",
    ],
    filters: Object.keys(variantFilters).length > 0 ? variantFilters : undefined,
    pagination: { skip: 0, take: 500 },
  })

  if (!variants.length) return res.json({ variants: [] })

  // Step 2: Get inventory item IDs from the link table directly
  const variantIds = variants.map((v: any) => v.id)

  const { data: inventoryLinks } = await query.graph({
    entity: "product_variant_inventory_item",
    fields: ["inventory_item_id", "variant_id"],
    filters: { variant_id: variantIds },
  })

  // variant_id → inventory_item_id
  const variantToInventoryItem = new Map<string, string>(
    inventoryLinks.map((link: any) => [link.variant_id, link.inventory_item_id])
  )

  // Step 3: Fetch inventory levels for all collected item IDs
  const inventoryItemIds = [...new Set(inventoryLinks.map((l: any) => l.inventory_item_id).filter(Boolean))]

  const levelsMap = new Map<string, { stocked_quantity: number; reserved_quantity: number; location_id: string }>()

  if (inventoryItemIds.length > 0) {
    const levels = await inventoryService.listInventoryLevels({
      inventory_item_id: inventoryItemIds,
    })

    for (const level of levels) {
      // stocked_quantity / reserved_quantity may be BigNumber-like — coerce.
      const stocked = Number(level.stocked_quantity ?? 0) || 0
      const reserved = Number(level.reserved_quantity ?? 0) || 0
      const existing = levelsMap.get(level.inventory_item_id)
      if (!existing) {
        levelsMap.set(level.inventory_item_id, {
          stocked_quantity: stocked,
          reserved_quantity: reserved,
          location_id: level.location_id,
        })
      } else {
        // Sum across multiple locations
        existing.stocked_quantity += stocked
        existing.reserved_quantity += reserved
      }
    }
  }

  const result = variants.map((variant: any) => {
    const inventoryItemId = variantToInventoryItem.get(variant.id) ?? null
    const level = inventoryItemId ? (levelsMap.get(inventoryItemId) ?? null) : null
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
      options: (variant.options ?? []).map((o: any) => ({
        title: o.option?.title ?? null,
        value: o.value ?? null,
      })),
      prices: (variant.prices ?? []).map((p: any) => ({
        id: p.id,
        amount: p.amount,
        currency_code: p.currency_code,
      })),
    }
  })

  res.json({ variants: result })
}
