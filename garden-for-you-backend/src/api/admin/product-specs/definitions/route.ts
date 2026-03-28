import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_SPEC_MODULE } from "../../../../modules/product-spec"
import type ProductSpecModuleService from "../../../../modules/product-spec/service"

// GET /admin/product-specs/definitions — список всех определений характеристик
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductSpecModuleService>(PRODUCT_SPEC_MODULE)

  const definitions = await service.listSpecDefinitions(
    {},
    { order: { sort_order: "ASC", created_at: "ASC" } }
  )

  res.status(200).json({ definitions })
}

// POST /admin/product-specs/definitions — создать новую характеристику
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductSpecModuleService>(PRODUCT_SPEC_MODULE)

  const { name, key, unit, type, options, sort_order } = req.body as {
    name: string
    key: string
    unit?: string
    type?: "text" | "number" | "boolean" | "select"
    options?: string[]
    sort_order?: number
  }

  if (!name || !key) {
    return res.status(400).json({ message: "name и key обязательны" })
  }

  const definition = await service.createSpecDefinitions({
    name,
    key,
    unit: unit ?? null,
    type: type ?? "text",
    // model.json() хранит как Record<string, unknown>, приводим string[] через any
    options: (options ?? null) as unknown as Record<string, unknown> | null,
    sort_order: sort_order ?? 0,
  })

  res.status(201).json({ definition })
}
