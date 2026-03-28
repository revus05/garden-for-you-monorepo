import type { Dispatch } from "@reduxjs/toolkit";
import { clearComparison } from "@/entities/comparison";
import { saveComparisonIdsRequest } from "@/entities/comparison/api";

export async function clearComparisonWithSync(dispatch: Dispatch) {
  dispatch(clearComparison());
  await saveComparisonIdsRequest([]);
}
