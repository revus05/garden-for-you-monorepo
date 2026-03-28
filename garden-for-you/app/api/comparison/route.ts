import { NextResponse } from "next/server";
import { MAX_COMPARISON_COUNT } from "@/entities/comparison";
import {
  clearComparisonCookie,
  setComparisonCookie,
} from "@/shared/lib/comparison-cookie.server";

export async function PUT(request: Request) {
  const body = (await request.json()) as unknown;
  const ids =
    body &&
    typeof body === "object" &&
    "ids" in body &&
    Array.isArray((body as { ids: unknown }).ids)
      ? ((body as { ids: unknown[] }).ids.filter(
          (v): v is string => typeof v === "string",
        ) as string[]).slice(0, MAX_COMPARISON_COUNT)
      : [];

  const response = NextResponse.json({ ids });

  if (ids.length === 0) {
    clearComparisonCookie(response);
  } else {
    setComparisonCookie(response, ids);
  }

  return response;
}
