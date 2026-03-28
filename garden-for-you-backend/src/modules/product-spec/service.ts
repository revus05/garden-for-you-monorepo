import { MedusaService } from "@medusajs/framework/utils"
import SpecDefinition from "./models/spec-definition"
import ProductSpec from "./models/product-spec"

class ProductSpecModuleService extends MedusaService({
  SpecDefinition,
  ProductSpec,
}) {}

export default ProductSpecModuleService
