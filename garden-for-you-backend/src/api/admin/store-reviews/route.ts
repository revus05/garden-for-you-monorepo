import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_REVIEW_MODULE } from "../../../modules/store-review"
import type StoreReviewModuleService from "../../../modules/store-review/service"

function mapReview(review: {
  id: string
  customer_id: string | null
  author_name: string
  phone: string | null
  rating: number
  message: string
  store_reply: string | null
  created_at: Date
  updated_at: Date
}) {
  return {
    id: review.id,
    customer_id: review.customer_id,
    author_name: review.author_name,
    phone: review.phone,
    rating: review.rating,
    message: review.message,
    store_reply: review.store_reply,
    created_at: review.created_at,
    updated_at: review.updated_at,
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const storeReviewModuleService = req.scope.resolve<StoreReviewModuleService>(
    STORE_REVIEW_MODULE
  )

  const reviews = await storeReviewModuleService.listStoreReviews(
    {},
    {
      order: {
        created_at: "DESC",
      },
    }
  )

  res.status(200).json({
    reviews: reviews.map(mapReview),
  })
}
