import { model } from "@medusajs/framework/utils"

const StoreReview = model.define("store_review", {
  id: model.id().primaryKey(),
  customer_id: model.text().nullable(),
  author_name: model.text(),
  phone: model.text().nullable(),
  rating: model.number(),
  message: model.text(),
  store_reply: model.text().nullable(),
})

export default StoreReview
