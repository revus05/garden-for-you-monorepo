import {
  STORE_REVIEWS_PAGE_SIZE,
  type StoreReviewsListResponse,
} from "@/entities/store-review";
import { getStoreReviews } from "@/entities/store-review/server";
import { withHomeLayout } from "@/widgets/layouts/home";
import { ReviewsPageClient } from "./reviews-page-client";

async function ReviewsPage() {
  const initialData: StoreReviewsListResponse = await getStoreReviews({
    limit: STORE_REVIEWS_PAGE_SIZE,
    offset: 0,
    sort: "newest",
  });

  return <ReviewsPageClient initialData={initialData} />;
}

export default withHomeLayout(ReviewsPage);
