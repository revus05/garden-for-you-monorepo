"use client";

import { STORE_REVIEWS_PAGE_SIZE } from "entities/store-review/model/constants";
import type {
  StoreReviewSort,
  StoreReviewsListResponse,
} from "entities/store-review/model/types";

export async function fetchStoreReviewsPage(params: {
  limit?: number;
  offset: number;
  sort: StoreReviewSort;
}): Promise<StoreReviewsListResponse> {
  const limit = params.limit ?? STORE_REVIEWS_PAGE_SIZE;
  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(params.offset),
    sort: params.sort,
  });

  const response = await fetch(
    `/api/store-reviews?${searchParams.toString()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Не удалось загрузить отзывы");
  }

  return response.json() as Promise<StoreReviewsListResponse>;
}
