import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ensureInventoryItemIds } from "../_helpers"

type BulkStockBody = {
  /**
   * - "all": apply delta to every variant
   * - "option": apply delta to all variants whose option "title" == "value"
   * - "variants": apply delta to the variants whose ids are in `variant_ids`
   */
  mode: "all" | "option" | "variants"
  delta: number
  option_title?: string
  option_value?: string
  variant_ids?: string[]
}

/**
 * POST /admin/inventory/bulk
 *
 * Adds `delta` (may be negative) to the current stocked_quantity of the
 * targeted variants at the default stock location. Returns number of
 * variants updated.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as BulkStockBody
  const { mode, delta } = body

  if (!Number.isInteger(delta)) {
    return res.status(400).json({ message: "delta должен быть целым числом" })
  }
  if (mode !== "all" && mode !== "option" && mode !== "variants") {
    return res.status(400).json({ message: "Неверный mode" })
  }
  if (mode === "option" && (!body.option_title || !body.option_value)) {
    return res.status(400).json({ message: "Для mode=option требуются option_title и option_value" })
  }
  if (mode === "variants" && (!Array.isArray(body.variant_ids) || body.variant_ids.length === 0)) {
    return res.status(400).json({ message: "Для mode=variants требуется variant_ids" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService: any = req.scope.resolve(Modules.INVENTORY)
  const stockLocationService: any = req.scope.resolve(Modules.STOCK_LOCATION)

  const [location] = await stockLocationService.listStockLocations({}, { take: 1 })
  if (!location) {
    return res.status(400).json({ message: "Складская позиция не найдена" })
  }

  // Step 1: Resolve target variant list
  const variantFields = ["id", "options.value", "options.option.title"]

  let targetVariantIds: string[]

  if (mode === "variants") {
    targetVariantIds = body.variant_ids as string[]
  } else if (mode === "all") {
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id"],
      pagination: { take: 5000 },
    })
    targetVariantIds = variants.map((v: any) => v.id)
  } else {
    // mode === "option"
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: variantFields,
      pagination: { take: 5000 },
    })
    const optTitle = body.option_title!.trim().toLowerCase()
    const optValue = body.option_value!.trim().toLowerCase()
    targetVariantIds = variants
      .filter((v: any) =>
        (v.options ?? []).some(
          (o: any) =>
            (o.option?.title ?? "").trim().toLowerCase() === optTitle &&
            (o.value ?? "").trim().toLowerCase() === optValue
        )
      )
      .map((v: any) => v.id)
  }

  if (targetVariantIds.length === 0) {
    return res.json({ updated_count: 0 })
  }

  // Step 2: inventory_item_id lookup — auto-creates missing items + links.
  const variantToItem = await ensureInventoryItemIds(req.scope, targetVariantIds)
  const inventoryItemIds = [...new Set(variantToItem.values())]

  if (inventoryItemIds.length === 0) {
    return res.json({ updated_count: 0 })
  }

  // Step 3: load current levels
  const existingLevels = await inventoryService.listInventoryLevels({
    inventory_item_id: inventoryItemIds,
    location_id: location.id,
  })

  const levelByItem = new Map<string, any>()
  for (const lvl of existingLevels) {
    levelByItem.set(lvl.inventory_item_id, lvl)
  }

  const toUpdate: { inventory_item_id: string; location_id: string; stocked_quantity: number }[] = []
  const toCreate: { inventory_item_id: string; location_id: string; stocked_quantity: number }[] = []

  for (const itemId of inventoryItemIds) {
    const current = levelByItem.get(itemId)
    // stocked_quantity may arrive as a BigNumber-like object from Medusa v2 —
    // coerce to a plain Number so `+ delta` performs arithmetic, not string concat.
    const currentQty = Number(current?.stocked_quantity ?? 0) || 0
    const next = Math.max(0, currentQty + delta)
    if (current) {
      toUpdate.push({ inventory_item_id: itemId, location_id: location.id, stocked_quantity: next })
    } else {
      toCreate.push({ inventory_item_id: itemId, location_id: location.id, stocked_quantity: next })
    }
  }

  if (toUpdate.length > 0) await inventoryService.updateInventoryLevels(toUpdate)
  if (toCreate.length > 0) await inventoryService.createInventoryLevels(toCreate)

  res.json({ updated_count: inventoryItemIds.length })
}
