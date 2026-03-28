import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_SPEC_MODULE } from "../../../../../modules/product-spec"
import type ProductSpecModuleService from "../../../../../modules/product-spec/service"

// GET /admin/product-specs/definitions/:id
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductSpecModuleService>(PRODUCT_SPEC_MODULE)
  const { id } = req.params

  try {
    const definition = await service.retrieveSpecDefinition(id)
    res.status(200).json({ definition })
  } catch {
    res.status(404).json({ message: "Характеристика не найдена" })
  }
}

// PUT /admin/product-specs/definitions/:id — обновить определение характеристики
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductSpecModuleService>(PRODUCT_SPEC_MODULE)
  const { id } = req.params

  const { name, unit, type, options, sort_order } = req.body as {
    name?: string
    unit?: string | null
    type?: "text" | "number" | "boolean" | "select"
    options?: string[] | null
    sort_order?: number
  }

  const definition = await service.updateSpecDefinitions({
    id,
    ...(name !== undefined && { name }),
    ...(unit !== undefined && { unit }),
    ...(type !== undefined && { type }),
    // model.json() хранит как Record<string, unknown>, приводим string[] через any
    ...(options !== undefined && { options: options as unknown as Record<string, unknown> | null }),
    ...(sort_order !== undefined && { sort_order }),
  })

  res.status(200).json({ definition })
}

// DELETE /admin/product-specs/definitions/:id — удалить определение (и все значения товаров)
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductSpecModuleService>(PRODUCT_SPEC_MODULE)
  const { id } = req.params

  await service.deleteSpecDefinitions(id)

  res.status(200).json({ id, deleted: true })
}
