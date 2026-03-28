import type { Dispatch } from "@reduxjs/toolkit";
import { addToComparison, type ComparisonProduct } from "@/entities/comparison";
import { saveComparisonIdsRequest } from "@/entities/comparison/api";

export async function addToComparisonWithSync(
  dispatch: Dispatch,
  product: ComparisonProduct,
  nextIds: string[],
) {
  dispatch(addToComparison(product));
  await saveComparisonIdsRequest(nextIds);
}
