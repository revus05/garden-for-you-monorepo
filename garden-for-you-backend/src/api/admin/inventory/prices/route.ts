import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

type PriceUpdateBody = {
  updates: { id: string; amount: number }[]
}

/**
 * POST /admin/inventory/prices
 * Body: { updates: [{ id, amount }] }
 *
 * Batch-updates variant price records by their id. Amounts are in the
 * currency the price was created with. Uses the pricing module directly.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { updates } = (req.body || {}) as PriceUpdateBody

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "updates не может быть пустым" })
  }
  for (const u of updates) {
    if (!u.id || typeof u.amount !== "number" || u.amount < 0) {
      return res.status(400).json({ message: "Неверный формат updates" })
    }
  }

  const pricingService: any = req.scope.resolve(Modules.PRICING)

  await pricingService.updatePrices(
    updates.map((u) => ({ id: u.id, amount: u.amount }))
  )

  res.json({ updated_count: updates.length })
}
