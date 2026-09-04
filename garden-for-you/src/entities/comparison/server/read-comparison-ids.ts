import "server-only";

import { cookies } from "next/headers";
import { COMPARISON_COOKIE } from "@/shared/config/comparison";
import { MAX_COMPARISON_COUNT } from "../model";

/**
 * Reads the comparison product ids from the cookie. Cookie-only, no network —
 * safe to call from the root layout on every route.
 */
export async function readComparisonIds(): Promise<string[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COMPARISON_COOKIE)?.value;
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is string => typeof v === "string")
      .slice(0, MAX_COMPARISON_COUNT);
  } catch {
    return [];
  }
}
