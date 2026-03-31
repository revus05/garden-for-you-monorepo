import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/** Resolves inventory_item_id for a variant using the link table directly. */
async function getInventoryItemId(query: any, variantId: string): Promise<string | null> {
  const { data: links } = await query.graph({
    entity: "product_variant_inventory_item",
    fields: ["inventory_item_id", "variant_id"],
    filters: { variant_id: variantId },
  })
  return links?.[0]?.inventory_item_id ?? null
}

/**
 * GET /admin/inventory/:variantId
 *
 * Returns the current stocked_quantity for a single variant.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { variantId } = req.params

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService: any = req.scope.resolve(Modules.INVENTORY)
  const stockLocationService: any = req.scope.resolve(Modules.STOCK_LOCATION)

  const inventoryItemId = await getInventoryItemId(query, variantId)

  if (!inventoryItemId) {
    return res.json({ variant_id: variantId, stocked_quantity: 0, reserved_quantity: 0, inventory_item_id: null, location_id: null })
  }

  const [location] = await stockLocationService.listStockLocations({}, { take: 1 })
  if (!location) {
    return res.json({ variant_id: variantId, stocked_quantity: 0, reserved_quantity: 0, inventory_item_id: inventoryItemId, location_id: null })
  }

  const levels = await inventoryService.listInventoryLevels({
    inventory_item_id: inventoryItemId,
    location_id: location.id,
  })

  const level = levels[0] ?? null

  res.json({
    variant_id: variantId,
    inventory_item_id: inventoryItemId,
    location_id: location.id,
    stocked_quantity: level?.stocked_quantity ?? 0,
    reserved_quantity: level?.reserved_quantity ?? 0,
  })
}

/**
 * PUT /admin/inventory/:variantId
 * Body: { stocked_quantity: number }
 *
 * Sets the absolute stocked_quantity for a variant in the default stock location.
 * Automatically creates the inventory level if it doesn't exist yet.
 */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const { variantId } = req.params
  const { stocked_quantity } = req.body as { stocked_quantity: number }

  if (!Number.isInteger(stocked_quantity) || stocked_quantity < 0) {
    return res.status(400).json({ message: "stocked_quantity должен быть целым неотрицательным числом" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService: any = req.scope.resolve(Modules.INVENTORY)
  const stockLocationService: any = req.scope.resolve(Modules.STOCK_LOCATION)

  const inventoryItemId = await getInventoryItemId(query, variantId)

  if (!inventoryItemId) {
    return res.status(400).json({
      message: "У этого варианта нет inventory item. Убедитесь, что manage_inventory = true и перезапустите бэкенд.",
    })
  }

  const [location] = await stockLocationService.listStockLocations({}, { take: 1 })
  if (!location) {
    return res.status(400).json({ message: "Складская позиция не найдена. Запустите npm run seed для первоначальной настройки." })
  }

  const existingLevels = await inventoryService.listInventoryLevels({
    inventory_item_id: inventoryItemId,
    location_id: location.id,
  })

  if (existingLevels.length > 0) {
    await inventoryService.updateInventoryLevels([{
      inventory_item_id: inventoryItemId,
      location_id: location.id,
      stocked_quantity,
    }])
  } else {
    await inventoryService.createInventoryLevels([{
      inventory_item_id: inventoryItemId,
      location_id: location.id,
      stocked_quantity,
    }])
  }

  res.json({ variant_id: variantId, stocked_quantity, location_id: location.id })
}
