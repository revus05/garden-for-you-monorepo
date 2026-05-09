import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"

type CategoryNode = {
  id: string
  category_children?: CategoryNode[]
}

function collectDescendantIds(cats: CategoryNode[]): string[] {
  const ids: string[] = []
  for (const cat of cats) {
    ids.push(cat.id)
    if (cat.category_children?.length) {
      ids.push(...collectDescendantIds(cat.category_children))
    }
  }
  return ids
}

function parseStringParam(val: unknown): string {
  return typeof val === "string" ? val : ""
}

function parseArrayParam(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v) => typeof v === "string")
  if (typeof val === "string" && val.length > 0) return [val]
  return []
}

const VALID_ORDERS = new Set(["-created_at", "created_at", "-title", "title"])

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const startTime = Date.now()
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER) as Logger
  const q = req.query as Record<string, unknown>

  const categoryIds = parseArrayParam(q.category_id)
  const parentHandle = parseStringParam(q.parent_handle)
  const offset = Math.max(0, parseInt(parseStringParam(q.offset) || "0", 10) || 0)
  const limit = Math.min(100, Math.max(1, parseInt(parseStringParam(q.limit) || "24", 10) || 24))
  const orderBy = VALID_ORDERS.has(parseStringParam(q.order)) ? parseStringParam(q.order) : "title"
  const searchQuery = parseStringParam(q.q).trim()
  const regionId = parseStringParam(q.region_id)

  // Resolve category IDs including all descendants
  let resolvedCategoryIds: string[] = []

  const categoryStartTime = Date.now()
  if (categoryIds.length > 0) {
    // Expand each selected category to include its descendants
    const { data: selectedCats } = await query.graph({
      entity: "product_category",
      filters: { id: categoryIds },
      fields: [
        "id",
        "category_children.id",
        "category_children.category_children.id",
        "category_children.category_children.category_children.id",
      ],
    })
    resolvedCategoryIds = collectDescendantIds(selectedCats as CategoryNode[])
  } else if (parentHandle) {
    // No specific selection — include all children of the parent tab
    const { data: parentCats } = await query.graph({
      entity: "product_category",
      filters: { handle: parentHandle },
      fields: [
        "id",
        "category_children.id",
        "category_children.category_children.id",
        "category_children.category_children.category_children.id",
      ],
    })
    for (const parent of parentCats as CategoryNode[]) {
      resolvedCategoryIds.push(...collectDescendantIds(parent.category_children ?? []))
    }
  }
  logger.info(`[PERF] Category resolution: ${Date.now() - categoryStartTime}ms`)

  // Build product filters
  const productFilter: Record<string, unknown> = { status: "published" }

  if (resolvedCategoryIds.length > 0) {
    productFilter.categories = { id: resolvedCategoryIds }
  }

  if (searchQuery) {
    productFilter.title = { $ilike: `%${searchQuery}%` }
  }

  // Parse sort order
  let orderObj: Record<string, "ASC" | "DESC"> = { title: "ASC" }
  if (orderBy === "-title") orderObj = { title: "DESC" }
  else if (orderBy === "created_at") orderObj = { created_at: "ASC" }
  else if (orderBy === "-created_at") orderObj = { created_at: "DESC" }

  const graphOptions: Parameters<typeof query.graph>[0] = {
    entity: "product",
    filters: productFilter,
    fields: [
      "id",
      "handle",
      "title",
      "thumbnail",
      "variants.id",
      "variants.inventory_quantity",
      "variants.manage_inventory",
      "variants.allow_backorder",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
    pagination: { take: limit, skip: offset, order: orderObj },
  }

  const productStartTime = Date.now()
  const { data: products, metadata } = await query.graph(graphOptions)
  logger.info(`[PERF] Product query: ${Date.now() - productStartTime}ms`)

  const count = (metadata as { count?: number } | undefined)?.count ?? 0
  const nextOffset = count > offset + limit ? offset + limit : undefined

  logger.info(`[PERF] Total time: ${Date.now() - startTime}ms`)

  res.status(200).json({ products, count, next_offset: nextOffset })
}
