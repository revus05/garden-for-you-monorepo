import { model } from "@medusajs/framework/utils"

export const Config = model.define("site_config", {
    id: model.id().primaryKey(),
    key: model.text().unique(),
    value: model.text(),
})