import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_REVIEW_MODULE } from "../../../modules/store-review"
import type StoreReviewModuleService from "../../../modules/store-review/service"
import { REVALIDATE_TAGS, revalidateStorefront } from "../../../lib/revalidate"

type CreateReviewBody = {
  author_name?: string
  phone?: string
  rating?: number | string
  message?: string
  store_reply?: string | null
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function normalizePhone(value: unknown): string {
  return typeof value === "string" ? value.replace(/\D/g, "") : ""
}

function normalizeRating(value: unknown): number {
  if (typeof value === "number") {
    return value
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return Number(value)
  }
  return Number.NaN
}

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

export async function POST(
  req: MedusaRequest<CreateReviewBody>,
  res: MedusaResponse
) {
  const body = req.body ?? {}
  const authorName = normalizeText(body.author_name)
  const message = normalizeText(body.message)
  const rating = normalizeRating(body.rating)
  const phone = normalizePhone(body.phone)
  const storeReply = normalizeText(body.store_reply)

  if (authorName.length < 1 || authorName.length > 120) {
    res.status(400).json({
      message: "Укажите имя автора (до 120 символов).",
    })
    return
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400).json({
      message: "Оценка должна быть целым числом от 1 до 5.",
    })
    return
  }

  if (message.length < 1 || message.length > 2000) {
    res.status(400).json({
      message: "Текст отзыва должен быть от 1 до 2000 символов.",
    })
    return
  }

  const storeReviewModuleService = req.scope.resolve<StoreReviewModuleService>(
    STORE_REVIEW_MODULE
  )

  const [review] = await storeReviewModuleService.createStoreReviews([
    {
      customer_id: null,
      author_name: authorName,
      phone: phone.length > 0 ? phone : null,
      rating,
      message,
      store_reply: storeReply.length > 0 ? storeReply : null,
    },
  ])

  void revalidateStorefront([REVALIDATE_TAGS.reviews])

  res.status(201).json({
    review: mapReview(review),
  })
}
