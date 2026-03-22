import "server-only";

import { STORE_REVIEWS_PAGE_SIZE } from "entities/store-review/model/constants";
import type {
  StoreReviewSort,
  StoreReviewsListResponse,
} from "entities/store-review/model/types";
import { requiredEnv } from "shared/lib/utils";

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  requiredEnv("NEXT_PUBLIC_MEDUSA_URL", process.env.NEXT_PUBLIC_MEDUSA_URL);
const MEDUSA_PUBLISHABLE_KEY = requiredEnv(
  "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
);

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

  const qs = searchParams.toString();
  const url = `${MEDUSA_BACKEND_URL}/store/store-reviews${qs ? `?${qs}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
    },
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
