import type { StoreReview } from "entities/store-review/model/types";
import type { CreateStoreReviewValues } from "./model";

type CreateStoreReviewResponse = {
  message: string;
  review: StoreReview;
};

export async function createStoreReviewRequest(
  values: CreateStoreReviewValues,
) {
  const response = await fetch("/api/store-reviews", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(values),
  });

  const data = (await response.json().catch(() => null)) as {
    message?: string;
    review?: StoreReview;
  } | null;

  if (!response.ok) {
    throw new Error(data?.message ?? "Не удалось сохранить отзыв");
  }

  return data as CreateStoreReviewResponse;
}
