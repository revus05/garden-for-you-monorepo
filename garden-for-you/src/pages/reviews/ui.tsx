import { STORE_REVIEWS_PAGE_SIZE } from "entities/store-review/model/constants";
import type { StoreReviewsListResponse } from "entities/store-review/model/types";
import { getStoreReviews } from "entities/store-review/server/get-store-reviews";
import { ReviewsPageClient } from "pages/reviews/reviews-page-client";
import { withHomeLayout } from "widgets/layouts/home";

async function ReviewsPage() {
  const initialData: StoreReviewsListResponse = await getStoreReviews({
    limit: STORE_REVIEWS_PAGE_SIZE,
    offset: 0,
    sort: "newest",
  });

  return <ReviewsPageClient initialData={initialData} />;
}

export default withHomeLayout(ReviewsPage);
