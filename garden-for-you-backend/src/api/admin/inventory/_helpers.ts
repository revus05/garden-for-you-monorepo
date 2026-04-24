import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Resolves (or creates+links) the inventory_item_id for a variant.
 *
 * Flow:
 *   1. Look up an existing link in product_variant_inventory_item.
 *   2. If missing, read the variant's sku/title, create a new inventory item,
 *      and link it to the variant via the link module.
 *
 * This lets callers treat every variant as inventory-managed, even if the
 * variant was created without manage_inventory = true at the time.
 */
export async function ensureInventoryItemId(
  scope: any,
  variantId: string
): Promise<string | null> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService: any = scope.resolve(Modules.INVENTORY)
  const link: any = scope.resolve(ContainerRegistrationKeys.LINK)

  const { data: existing } = await query.graph({
    entity: "product_variant_inventory_item",
    fields: ["inventory_item_id", "variant_id"],
    filters: { variant_id: variantId },
  })

  if (existing?.[0]?.inventory_item_id) {
    return existing[0].inventory_item_id
  }

  // Fetch variant for sku/title — useful when seeding the inventory item.
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku", "title"],
    filters: { id: variantId },
  })
  const variant = variants?.[0]
  if (!variant) return null

  const [created] = await inventoryService.createInventoryItems([
    {
      sku: variant.sku ?? null,
      title: variant.title ?? null,
    },
  ])

  await link.create([
    {
      [Modules.PRODUCT]: { variant_id: variantId },
      [Modules.INVENTORY]: { inventory_item_id: created.id },
      data: { required_quantity: 1 },
    },
  ])

  return created.id
}

/**
 * Batch variant of ensureInventoryItemId. Returns a map variant_id → inventory_item_id.
 * Variants missing an inventory item will have one created and linked.
 */
export async function ensureInventoryItemIds(
  scope: any,
  variantIds: string[]
): Promise<Map<string, string>> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService: any = scope.resolve(Modules.INVENTORY)
  const link: any = scope.resolve(ContainerRegistrationKeys.LINK)

  const result = new Map<string, string>()
  if (variantIds.length === 0) return result

  const { data: links } = await query.graph({
    entity: "product_variant_inventory_item",
    fields: ["inventory_item_id", "variant_id"],
    filters: { variant_id: variantIds },
  })
  for (const l of links ?? []) {
    if (l.variant_id && l.inventory_item_id) {
      result.set(l.variant_id, l.inventory_item_id)
    }
  }

  const missing = variantIds.filter((id) => !result.has(id))
  if (missing.length === 0) return result

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku", "title"],
    filters: { id: missing },
  })

  if (!variants?.length) return result

  const created = await inventoryService.createInventoryItems(
    variants.map((v: any) => ({ sku: v.sku ?? null, title: v.title ?? null }))
  )

  const linksToCreate = variants.map((v: any, i: number) => ({
    [Modules.PRODUCT]: { variant_id: v.id },
    [Modules.INVENTORY]: { inventory_item_id: created[i].id },
    data: { required_quantity: 1 },
  }))
  await link.create(linksToCreate)

  variants.forEach((v: any, i: number) => {
    result.set(v.id, created[i].id)
  })

  return result
}
