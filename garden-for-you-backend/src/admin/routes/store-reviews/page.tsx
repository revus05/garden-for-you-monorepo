import { ChatBubbleLeftRight } from "@medusajs/icons"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"

export const config = defineRouteConfig({
  label: "Отзывы о магазине",
  icon: ChatBubbleLeftRight,
  rank: 42,
})

type StoreReviewRow = {
  id: string
  author_name: string
  phone: string | null
  rating: number
  message: string
  store_reply: string | null
  created_at: string
}

type ListResponse = {
  reviews: StoreReviewRow[]
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const StoreReviewsPage = () => {
  const queryClient = useQueryClient()
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "store-reviews"],
    queryFn: async () => {
      const res = await sdk.client.fetch<ListResponse>("/admin/store-reviews", {
        method: "GET",
      })
      return res
    },
  })

  const reviews = data?.reviews ?? []

  const replyMutation = useMutation({
    mutationFn: async ({ id, store_reply }: { id: string; store_reply: string | null }) => {
      await sdk.client.fetch(`/admin/store-reviews/${id}`, {
        method: "PATCH",
        body: { store_reply },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "store-reviews"] })
      toast.success("Ответ сохранён")
    },
    onError: () => {
      toast.error("Не удалось сохранить ответ")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await sdk.client.fetch(`/admin/store-reviews/${id}`, {
        method: "DELETE",
        headers: {
          accept: "text/plain",
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "store-reviews"] })
      toast.success("Отзыв удалён")
    },
    onError: () => {
      toast.error("Не удалось удалить отзыв")
    },
  })

  const sorted = useMemo(
    () => [...reviews].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [reviews],
  )

  if (isLoading) {
    return (
      <Container className="p-6">
        <Text>Загрузка отзывов…</Text>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">Не удалось загрузить отзывы.</Text>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Отзывы о магазине</Heading>
        <Text size="small" className="text-ui-fg-muted">
          {sorted.length} отзывов
        </Text>
      </div>

      <div className="flex flex-col gap-4 px-6 py-6">
        {sorted.length === 0 ? (
          <Text className="text-ui-fg-muted">Пока нет отзывов.</Text>
        ) : (
          sorted.map((review) => {
            const draft =
              drafts[review.id] ??
              (review.store_reply != null ? review.store_reply : "")

            return (
              <div
                key={review.id}
                className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4 shadow-elevation-card-rest"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Text weight="plus" size="base">
                      {review.author_name}
                    </Text>
                    <Text size="small" className="text-ui-fg-muted">
                      Телефон:{" "}
                      <span className="text-ui-fg-base">
                        {review.phone && review.phone.length > 0 ? review.phone : "—"}
                      </span>
                    </Text>
                    <Text size="small" className="mt-1 text-ui-fg-muted">
                      {formatDate(review.created_at)} · Оценка: {review.rating} / 5
                    </Text>
                  </div>
                  <Button
                    variant="danger"
                    size="small"
                    isLoading={deleteMutation.isPending}
                    disabled={replyMutation.isPending}
                    onClick={() => {
                      if (
                        typeof window !== "undefined" &&
                        !window.confirm("Удалить этот отзыв?")
                      ) {
                        return
                      }
                      deleteMutation.mutate(review.id)
                    }}
                  >
                    Удалить
                  </Button>
                </div>

                <Text className="mt-3 whitespace-pre-wrap">{review.message}</Text>

                <div className="mt-4 space-y-2">
                  <Text size="small" weight="plus">
                    Ответ магазина
                  </Text>
                  <Textarea
                    rows={4}
                    value={draft}
                    placeholder="Текст ответа покупателям…"
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="small"
                      isLoading={replyMutation.isPending}
                      disabled={deleteMutation.isPending}
                      onClick={() =>
                        replyMutation.mutate({
                          id: review.id,
                          store_reply: draft.trim().length > 0 ? draft.trim() : null,
                        })
                      }
                    >
                      Сохранить ответ
                    </Button>
                    {review.store_reply ? (
                      <Button
                        size="small"
                        variant="secondary"
                        isLoading={replyMutation.isPending}
                        onClick={() => {
                          setDrafts((prev) => ({ ...prev, [review.id]: "" }))
                          replyMutation.mutate({ id: review.id, store_reply: null })
                        }}
                      >
                        Убрать ответ
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Container>
  )
}

export default StoreReviewsPage
