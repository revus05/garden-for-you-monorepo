import { MedusaService } from "@medusajs/framework/utils"
import StoreReview from "./models/store-review"

class StoreReviewModuleService extends MedusaService({
  StoreReview,
}) {}

export default StoreReviewModuleService
