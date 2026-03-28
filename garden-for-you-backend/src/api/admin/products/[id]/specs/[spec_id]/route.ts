import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_SPEC_MODULE } from "../../../../../../modules/product-spec"
import type ProductSpecModuleService from "../../../../../../modules/product-spec/service"

// DELETE /admin/products/:id/specs/:spec_id — удалить одну характеристику товара
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductSpecModuleService>(PRODUCT_SPEC_MODULE)
  const { spec_id } = req.params

  await service.deleteProductSpecs(spec_id)

  res.status(200).json({ id: spec_id, deleted: true })
}
