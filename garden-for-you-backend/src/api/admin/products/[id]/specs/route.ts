import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_SPEC_MODULE } from "../../../../../modules/product-spec"
import type ProductSpecModuleService from "../../../../../modules/product-spec/service"

// GET /admin/products/:id/specs — получить все характеристики товара
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductSpecModuleService>(PRODUCT_SPEC_MODULE)
  const { id: product_id } = req.params

  const specs = await service.listProductSpecs(
    { product_id },
    { relations: ["definition"], order: { definition: { sort_order: "ASC" } } }
  )

  res.status(200).json({ specs })
}

// POST /admin/products/:id/specs — задать/обновить характеристики товара (upsert)
// Body: { specs: [{ definition_id: string, value: string }] }
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductSpecModuleService>(PRODUCT_SPEC_MODULE)
  const { id: product_id } = req.params

  const { specs } = req.body as {
    specs: { definition_id: string; value: string }[]
  }

  if (!Array.isArray(specs) || specs.length === 0) {
    return res.status(400).json({ message: "specs — обязательный массив" })
  }

  // Получаем существующие характеристики товара
  const existing = await service.listProductSpecs(
    { product_id },
    { relations: ["definition"] }
  )
  // Medusa генерирует FK как definition_id (по имени relation "definition")
  const existingMap = new Map(existing.map((s) => [s.definition_id, s]))

  const toCreate: { product_id: string; definition_id: string; value: string }[] = []
  const toUpdate: { id: string; value: string }[] = []

  for (const spec of specs) {
    const found = existingMap.get(spec.definition_id)
    if (found) {
      toUpdate.push({ id: found.id, value: spec.value })
    } else {
      toCreate.push({ product_id, definition_id: spec.definition_id, value: spec.value })
    }
  }

  if (toCreate.length > 0) {
    await service.createProductSpecs(toCreate)
  }

  if (toUpdate.length > 0) {
    await service.updateProductSpecs(toUpdate)
  }

  const all = await service.listProductSpecs(
    { product_id },
    { relations: ["definition"], order: { definition: { sort_order: "ASC" } } }
  )

  res.status(200).json({ specs: all })
}
