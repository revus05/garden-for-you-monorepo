import "server-only";
import { medusaFetch } from "@/shared/api/medusa-fetch";
import { STORE_REVIEWS_PAGE_SIZE } from "../model/constants";
import type { StoreReviewSort, StoreReviewsListResponse } from "../model/types";

export type GetStoreReviewsParams = {
  limit?: number;
  offset?: number;
  sort?: StoreReviewSort;
};

export async function getStoreReviews(
  params?: GetStoreReviewsParams,
): Promise<StoreReviewsListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit != null) {
    searchParams.set("limit", String(params.limit));
  }
  if (params?.offset != null) {
    searchParams.set("offset", String(params.offset));
  }
  if (params?.sort != null) {
    searchParams.set("sort", params.sort);
  }

  const response = await medusaFetch("/store/store-reviews", {
    method: "GET",
    searchParams,
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      reviews: [],
      pagination: {
        offset: params?.offset ?? 0,
        limit: params?.limit ?? STORE_REVIEWS_PAGE_SIZE,
        has_more: false,
        sort: params?.sort ?? "newest",
      },
    };
  }

  const data = (await response
    .json()
    .catch(() => null)) as StoreReviewsListResponse | null;

  if (!data?.pagination) {
    return {
      reviews: data?.reviews ?? [],
      pagination: {
        offset: params?.offset ?? 0,
        limit: params?.limit ?? STORE_REVIEWS_PAGE_SIZE,
        has_more: false,
        sort: params?.sort ?? "newest",
      },
    };
  }

  return data;
}
