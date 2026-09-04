import type { Dispatch } from "@reduxjs/toolkit";
import { addToComparison } from "@/entities/comparison";
import { saveComparisonIdsRequest } from "@/entities/comparison/api";

export async function addToComparisonWithSync(
  dispatch: Dispatch,
  productId: string,
  nextIds: string[],
) {
  dispatch(addToComparison(productId));
  await saveComparisonIdsRequest(nextIds);
}
