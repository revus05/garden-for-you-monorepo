import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

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

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "sku", "inventory_items.inventory_item_id"],
    filters: { id: variantId },
  })

  const variant = variants?.[0]
  if (!variant) return res.status(404).json({ message: "Вариант не найден" })

  const inventoryItemId = variant.inventory_items?.[0]?.inventory_item_id ?? null

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

  if (typeof stocked_quantity !== "number" || !Number.isInteger(stocked_quantity) || stocked_quantity < 0) {
    return res.status(400).json({ message: "stocked_quantity должен быть целым неотрицательным числом" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService: any = req.scope.resolve(Modules.INVENTORY)
  const stockLocationService: any = req.scope.resolve(Modules.STOCK_LOCATION)

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "inventory_items.inventory_item_id"],
    filters: { id: variantId },
  })

  const variant = variants?.[0]
  if (!variant) return res.status(404).json({ message: "Вариант не найден" })

  const inventoryItemId = variant.inventory_items?.[0]?.inventory_item_id ?? null
  if (!inventoryItemId) {
    return res.status(400).json({ message: "У этого варианта нет inventory item (manage_inventory = false)" })
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
