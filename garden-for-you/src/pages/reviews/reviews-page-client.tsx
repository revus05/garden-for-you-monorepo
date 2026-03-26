"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchStoreReviewsPage,
  STORE_REVIEWS_PAGE_SIZE,
  type StoreReview,
  type StoreReviewSort,
  type StoreReviewsListResponse,
} from "@/entities/store-review";
import { CreateStoreReviewForm } from "@/features/store-review/create-review";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";

const SORT_OPTIONS: { value: StoreReviewSort; label: string }[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "positive", label: "Сначала положительные" },
  { value: "negative", label: "Сначала отрицательные" },
];

function formatReviewDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function renderStars(rating: number) {
  return `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
}

type ReviewsPageClientProps = {
  initialData: StoreReviewsListResponse;
};

export function ReviewsPageClient({ initialData }: ReviewsPageClientProps) {
  const [sort, setSort] = useState<StoreReviewSort>(
    initialData.pagination.sort,
  );
  const [reviews, setReviews] = useState<StoreReview[]>(initialData.reviews);
  const [hasMore, setHasMore] = useState(initialData.pagination.has_more);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortLoading, setSortLoading] = useState(false);

  const reviewsRef = useRef(reviews);
  reviewsRef.current = reviews;

  const onSortChange = async (value: string) => {
    const next = value as StoreReviewSort;
    setSort(next);
    setSortLoading(true);
    try {
      const data = await fetchStoreReviewsPage({
        offset: 0,
        limit: STORE_REVIEWS_PAGE_SIZE,
        sort: next,
      });
      setReviews(data.reviews);
      setHasMore(data.pagination.has_more);
    } finally {
      setSortLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || sortLoading) {
      return;
    }
    setLoadingMore(true);
    try {
      const offset = reviewsRef.current.length;
      const data = await fetchStoreReviewsPage({
        offset,
        limit: STORE_REVIEWS_PAGE_SIZE,
        sort,
      });
      setReviews((prev) => [...prev, ...data.reviews]);
      setHasMore(data.pagination.has_more);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, sortLoading, sort]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { root: null, rootMargin: "240px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="mx-auto w-full max-w-185 px-4 py-10">
      <section className="mt-10 space-y-4">
        <div>
          <h2 className="text-2xl font-black">Отзывы наших клиентов</h2>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Select
            disabled={sortLoading}
            onValueChange={(v) => void onSortChange(v)}
            value={sort}
          >
            <SelectTrigger className="w-full min-w-55 sm:w-65">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CreateStoreReviewForm />
        </div>
        {sortLoading ? (
          <p className="text-sm text-muted-foreground">Загружаем…</p>
        ) : null}

        {!sortLoading && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-[24px] bg-background-secondary p-5 shadow-md"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-2 items-center">
                    <span className="text-lg font-bold text-primary">
                      {review.author_name}
                    </span>
                    <span className="text-foreground/50">•</span>
                    <span className="text tracking-[0.2em] text-primary">
                      {renderStars(review.rating)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatReviewDate(review.created_at)}
                  </p>
                </div>
                <p className="mt-4 whitespace-pre-line text-base leading-7 text-foreground/90">
                  {review.message}
                </p>
                {review.store_reply ? (
                  <div className="mt-4 rounded-3xl border border-primary/20 bg-background/80 p-4">
                    <p className="text-sm font-bold text-primary">
                      Ответ магазина
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground/90">
                      {review.store_reply}
                    </p>
                  </div>
                ) : null}
              </article>
            ))}
            <div aria-hidden="true" className="h-0.5" ref={sentinelRef} />
            {loadingMore ? (
              <p className="py-2 text-center text-sm text-muted-foreground">
                Загружаем ещё…
              </p>
            ) : null}
            {!hasMore && reviews.length > 0 ? (
              <p className="py-2 text-center text-xs text-muted-foreground">
                Вы просмотрели все отзывы
              </p>
            ) : null}
          </div>
        ) : null}

        {!sortLoading && reviews.length === 0 ? (
          <div className="rounded-[24px] bg-background-secondary p-5 text-sm text-muted-foreground shadow-md">
            Пока отзывов о магазине нет. Нажмите «Оставить отзыв», чтобы
            написать первым.
          </div>
        ) : null}
      </section>
    </div>
  );
}
