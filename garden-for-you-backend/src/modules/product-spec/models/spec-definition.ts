import { model } from "@medusajs/framework/utils"
import ProductSpec from "./product-spec"

// Справочник характеристик: что вообще можно задавать товарам
// Например: { name: "Размер косточки", key: "seed_size", type: "select", options: ["мелкая","средняя","крупная"] }
const SpecDefinition = model.define("spec_definition", {
  id: model.id().primaryKey(),
  name: model.text(),              // Человекочитаемое название, e.g. "Размер косточки"
  key: model.text(),               // Уникальный ключ, e.g. "seed_size" — используется для сравнения
  unit: model.text().nullable(),   // Единица измерения, e.g. "см", "г" (не обязательно)
  type: model.enum(["text", "number", "boolean", "select"]).default("text"),
  options: model.json().nullable(), // Для type="select" — массив допустимых значений
  sort_order: model.number().default(0),
  specs: model.hasMany(() => ProductSpec, { mappedBy: "definition" }),
})

export default SpecDefinition
