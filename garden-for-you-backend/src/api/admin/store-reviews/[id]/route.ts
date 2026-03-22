import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_REVIEW_MODULE } from "../../../../modules/store-review"
import type StoreReviewModuleService from "../../../../modules/store-review/service"

type PatchBody = {
  store_reply?: string | null
}

function normalizeReply(reply: unknown): string | null {
  if (reply === null || reply === undefined) {
    return null
  }

  if (typeof reply !== "string") {
    return null
  }

  const trimmed = reply.trim()

  return trimmed.length > 0 ? trimmed : null
}

export async function PATCH(
  req: MedusaRequest<PatchBody>,
  res: MedusaResponse
) {
  const id = req.params.id

  if (!id) {
    res.status(400).json({ message: "Не указан идентификатор отзыва." })
    return
  }

  const body = req.body ?? {}
  const storeReply = normalizeReply(body.store_reply)

  if (storeReply !== null && storeReply.length > 4000) {
    res.status(400).json({
      message: "Ответ магазина не должен быть длиннее 4000 символов.",
    })
    return
  }

  const storeReviewModuleService = req.scope.resolve<StoreReviewModuleService>(
    STORE_REVIEW_MODULE
  )

  const updatedList = await storeReviewModuleService.updateStoreReviews([
    {
      id,
      store_reply: storeReply,
    },
  ])
  const updated = updatedList[0]

  if (!updated) {
    res.status(404).json({ message: "Отзыв не найден." })
    return
  }

  res.status(200).json({
    review: {
      id: updated.id,
      customer_id: updated.customer_id,
      author_name: updated.author_name,
      phone: updated.phone,
      rating: updated.rating,
      message: updated.message,
      store_reply: updated.store_reply,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    },
  })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id

  if (!id) {
    res.status(400).json({ message: "Не указан идентификатор отзыва." })
    return
  }

  const storeReviewModuleService = req.scope.resolve<StoreReviewModuleService>(
    STORE_REVIEW_MODULE
  )

  try {
    await storeReviewModuleService.deleteStoreReviews(id)
  } catch {
    res.status(404).json({ message: "Отзыв не найден." })
    return
  }

  res.status(204).send()
}
