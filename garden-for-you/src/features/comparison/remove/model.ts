import type { Dispatch } from "@reduxjs/toolkit";
import { removeFromComparison } from "@/entities/comparison";
import { saveComparisonIdsRequest } from "@/entities/comparison/api";

export async function removeFromComparisonWithSync(
  dispatch: Dispatch,
  productId: string,
  nextIds: string[],
) {
  dispatch(removeFromComparison(productId));
  await saveComparisonIdsRequest(nextIds);
}
