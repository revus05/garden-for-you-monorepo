import { model } from "@medusajs/framework/utils"
import SpecDefinition from "./spec-definition"

// Значение характеристики для конкретного товара
const ProductSpec = model.define("product_spec", {
  id: model.id().primaryKey(),
  product_id: model.text(),         // ID товара из Medusa product module
  value: model.text(),              // Значение, e.g. "мелкая", "25", "true"
  definition: model.belongsTo(() => SpecDefinition, { mappedBy: "specs" }),
})

export default ProductSpec
