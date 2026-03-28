import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_SPEC_MODULE } from "../../../../../modules/product-spec"
import type ProductSpecModuleService from "../../../../../modules/product-spec/service"

// GET /store/products/:id/specs — публичный эндпоинт для получения характеристик товара
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductSpecModuleService>(PRODUCT_SPEC_MODULE)
  const { id: product_id } = req.params

  const specs = await service.listProductSpecs(
    { product_id },
    { relations: ["definition"], order: { definition: { sort_order: "ASC" } } }
  )

  res.status(200).json({ specs })
}
