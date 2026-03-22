export type StoreReview = {
  id: string;
  author_name: string;
  rating: number;
  message: string;
  store_reply: string | null;
  created_at: string;
};

export type StoreReviewSort = "newest" | "oldest" | "positive" | "negative";

export type StoreReviewsPagination = {
  offset: number;
  limit: number;
  has_more: boolean;
  sort: StoreReviewSort;
};

export type StoreReviewsListResponse = {
  reviews: StoreReview[];
  pagination: StoreReviewsPagination;
};
