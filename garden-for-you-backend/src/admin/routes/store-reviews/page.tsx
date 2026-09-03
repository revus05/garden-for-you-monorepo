import {ChatBubbleLeftRight} from "@medusajs/icons"
import {defineRouteConfig} from "@medusajs/admin-sdk"
import {Button, Container, Heading, Input, Select, Text, Textarea, toast,} from "@medusajs/ui"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {useMemo, useState} from "react"
import {sdk} from "../../lib/sdk"

export const config = defineRouteConfig({
  label: "Отзывы о питомнике",
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

type NewReviewForm = {
  author_name: string
  phone: string
  rating: string
  message: string
  store_reply: string
  created_at: string
}

function toDateInputValue(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const offset = date.getTimezoneOffset() * 60 * 1000

  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function todayInputValue() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60 * 1000

  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function makeEmptyNewReview(): NewReviewForm {
  return {
    author_name: "",
    phone: "",
    rating: "5",
    message: "",
    store_reply: "",
    created_at: todayInputValue(),
  }
}

const StoreReviewsPage = () => {
  const queryClient = useQueryClient()
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [dateDrafts, setDateDrafts] = useState<Record<string, string>>({})
  const [newReview, setNewReview] = useState<NewReviewForm>(makeEmptyNewReview)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "store-reviews"],
    queryFn: async () => {
      return await sdk.client.fetch<ListResponse>("/admin/store-reviews", {
        method: "GET",
      })
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

  const dateMutation = useMutation({
    mutationFn: async ({ id, created_at }: { id: string; created_at: string }) => {
      await sdk.client.fetch(`/admin/store-reviews/${id}`, {
        method: "PATCH",
        body: { created_at },
      })
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "store-reviews"] })
      setDateDrafts((prev) => {
        const next = { ...prev }
        delete next[variables.id]
        return next
      })
      toast.success("Дата обновлена")
    },
    onError: () => {
      toast.error("Не удалось изменить дату")
    },
  })

  const createMutation = useMutation({
    mutationFn: async (form: NewReviewForm) => {
      await sdk.client.fetch("/admin/store-reviews", {
        method: "POST",
        body: {
          author_name: form.author_name,
          phone: form.phone,
          rating: Number(form.rating),
          message: form.message,
          store_reply: form.store_reply,
          created_at: form.created_at,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "store-reviews"] })
      setNewReview(makeEmptyNewReview())
      toast.success("Отзыв добавлен")
    },
    onError: () => {
      toast.error("Не удалось добавить отзыв")
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
        <Heading level="h1">Отзывы о питомнике</Heading>
        <Text size="small" className="text-ui-fg-muted">
          {sorted.length} отзывов
        </Text>
      </div>

      <div className="flex flex-col gap-4 border-b border-ui-border-base px-6 py-6">
        <Heading level="h2">Добавить отзыв</Heading>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (newReview.author_name.trim().length === 0) {
              toast.error("Укажите имя автора")
              return
            }
            if (newReview.message.trim().length === 0) {
              toast.error("Введите текст отзыва")
              return
            }
            createMutation.mutate(newReview)
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <Text size="small" weight="plus">
                Имя автора
              </Text>
              <Input
                value={newReview.author_name}
                placeholder="Имя"
                onChange={(e) =>
                  setNewReview((prev) => ({ ...prev, author_name: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Text size="small" weight="plus">
                Телефон
              </Text>
              <Input
                value={newReview.phone}
                placeholder="Необязательно"
                onChange={(e) =>
                  setNewReview((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Text size="small" weight="plus">
                Оценка
              </Text>
              <Select
                value={newReview.rating}
                onValueChange={(value) =>
                  setNewReview((prev) => ({ ...prev, rating: value }))
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <Select.Item key={n} value={String(n)}>
                      {n} / 5
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Text size="small" weight="plus">
                Дата отзыва
              </Text>
              <Input
                type="date"
                value={newReview.created_at}
                onChange={(e) =>
                  setNewReview((prev) => ({ ...prev, created_at: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Text size="small" weight="plus">
              Текст отзыва
            </Text>
            <Textarea
              rows={3}
              value={newReview.message}
              placeholder="Текст отзыва…"
              onChange={(e) =>
                setNewReview((prev) => ({ ...prev, message: e.target.value }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Text size="small" weight="plus">
              Ответ питомника (необязательно)
            </Text>
            <Textarea
              rows={2}
              value={newReview.store_reply}
              placeholder="Текст ответа покупателям…"
              onChange={(e) =>
                setNewReview((prev) => ({ ...prev, store_reply: e.target.value }))
              }
            />
          </div>
          <div>
            <Button type="submit" isLoading={createMutation.isPending}>
              Добавить отзыв
            </Button>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-4 px-6 py-6">
        {sorted.length === 0 ? (
          <Text className="text-ui-fg-muted">Пока нет отзывов.</Text>
        ) : (
          sorted.map((review) => {
            const draft =
              drafts[review.id] ??
              (review.store_reply != null ? review.store_reply : "")
            const dateDraft =
              dateDrafts[review.id] ?? toDateInputValue(review.created_at)

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
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Input
                        type="date"
                        className="w-40"
                        value={dateDraft}
                        onChange={(e) =>
                          setDateDrafts((prev) => ({
                            ...prev,
                            [review.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={
                          dateDraft.length === 0 ||
                          dateDraft === toDateInputValue(review.created_at)
                        }
                        isLoading={
                          dateMutation.isPending &&
                          dateMutation.variables?.id === review.id
                        }
                        onClick={() =>
                          dateMutation.mutate({
                            id: review.id,
                            created_at: dateDraft,
                          })
                        }
                      >
                        Изменить дату
                      </Button>
                    </div>
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
                    Ответ питомника
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
