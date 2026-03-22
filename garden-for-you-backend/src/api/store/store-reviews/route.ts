import type {
  MedusaResponse,
  MedusaStoreRequest,
} from "@medusajs/framework/http"
import type { ICustomerModuleService } from "@medusajs/types"
import { Modules } from "@medusajs/framework/utils"
import { STORE_REVIEW_MODULE } from "../../../modules/store-review"
import type StoreReviewModuleService from "../../../modules/store-review/service"

type CreateStoreReviewBody = {
  author_name?: string
  phone?: string
  rating?: number
  message?: string
}

function normalizeAuthorName(name: unknown): string {
  return typeof name === "string" ? name.trim() : ""
}

function normalizeMessage(message: unknown): string {
  return typeof message === "string" ? message.trim() : ""
}

function normalizePhone(phone: unknown): string {
  if (typeof phone !== "string") {
    return ""
  }

  return phone.replace(/\D/g, "")
}

function normalizeRating(rating: unknown): number {
  if (typeof rating === "number") {
    return rating
  }

  if (typeof rating === "string" && rating.trim().length > 0) {
    return Number(rating)
  }

  return Number.NaN
}

async function resolveCustomerName(
  req: MedusaStoreRequest
): Promise<{ customerId: string | null; authorName: string | null }> {
  const customerId = req.auth_context?.actor_id ?? null

  if (!customerId) {
    return {
      customerId: null,
      authorName: null,
    }
  }

  const customerModuleService = req.scope.resolve<ICustomerModuleService>(
    Modules.CUSTOMER
  )
  const customer = await customerModuleService.retrieveCustomer(customerId)

  return {
    customerId,
    authorName:
      [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      customer.email ||
      null,
  }
}

const SORT_MODES = ["newest", "oldest", "positive", "negative"] as const
type SortMode = (typeof SORT_MODES)[number]

function parseSort(value: unknown): SortMode {
  const s = typeof value === "string" ? value : ""
  return SORT_MODES.includes(s as SortMode) ? (s as SortMode) : "newest"
}

function parseOffset(value: unknown): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function parseLimit(value: unknown): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN
  const fallback = 12
  if (!Number.isFinite(n)) {
    return fallback
  }
  return Math.min(Math.max(n, 1), 50)
}

export async function GET(req: MedusaStoreRequest, res: MedusaResponse) {
  const storeReviewModuleService = req.scope.resolve<StoreReviewModuleService>(
    STORE_REVIEW_MODULE
  )

  const q = req.query ?? {}
  const sort = parseSort(q.sort)
  const offset = parseOffset(q.offset)
  const limit = parseLimit(q.limit)

  let order: { created_at: "ASC" | "DESC"; rating?: "ASC" | "DESC" } = {
    created_at: "DESC",
  }
  if (sort === "oldest") {
    order = { created_at: "ASC" }
  } else if (sort === "positive") {
    order = { rating: "DESC", created_at: "DESC" }
  } else if (sort === "negative") {
    order = { rating: "ASC", created_at: "DESC" }
  }

  const take = limit + 1
  const rows = await storeReviewModuleService.listStoreReviews(
    {},
    {
      skip: offset,
      take,
      order,
    }
  )

  const hasMore = rows.length > limit
  const slice = rows.slice(0, limit)

  res.status(200).json({
    reviews: slice.map((review) => ({
      id: review.id,
      author_name: review.author_name,
      rating: review.rating,
      message: review.message,
      store_reply: review.store_reply ?? null,
      created_at: review.created_at,
    })),
    pagination: {
      offset,
      limit,
      has_more: hasMore,
      sort,
    },
  })
}

export async function POST(
  req: MedusaStoreRequest<CreateStoreReviewBody>,
  res: MedusaResponse
) {
  const body = req.body ?? {}
  const rating = normalizeRating(body.rating)
  const message = normalizeMessage(body.message)
  const providedAuthorName = normalizeAuthorName(body.author_name)
  const phoneDigits = normalizePhone(body.phone)

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400).json({
      message: "Оценка должна быть целым числом от 1 до 5.",
    })
    return
  }

  if (message.length < 1) {
    res.status(400).json({
      message: "Текст отзыва не может быть пустым.",
    })
    return
  }

  if (message.length > 2000) {
    res.status(400).json({
      message: "Текст отзыва должен быть не длиннее 2000 символов.",
    })
    return
  }

  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    res.status(400).json({
      message: "Укажите корректный номер телефона (от 10 до 15 цифр).",
    })
    return
  }

  const { customerId, authorName: customerAuthorName } =
    await resolveCustomerName(req)
  const authorName = providedAuthorName || customerAuthorName || "Анонимный пользователь"

  if (authorName.length > 120) {
    res.status(400).json({
      message: "Имя автора должно быть не длиннее 120 символов.",
    })
    return
  }

  const storeReviewModuleService = req.scope.resolve<StoreReviewModuleService>(
    STORE_REVIEW_MODULE
  )

  const [review] = await storeReviewModuleService.createStoreReviews([
    {
      customer_id: customerId,
      author_name: authorName,
      phone: phoneDigits,
      rating,
      message,
    },
  ])

  res.status(201).json({
    review: {
      id: review.id,
      author_name: review.author_name,
      rating: review.rating,
      message: review.message,
      store_reply: review.store_reply ?? null,
      created_at: review.created_at,
    },
    message: "Отзыв сохранен.",
  })
}
