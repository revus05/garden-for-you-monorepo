import { publicEnv, resolveMedusaBaseUrl } from "@/shared/config/env";

const PUBLISHABLE_KEY = publicEnv.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

export type MedusaFetchInit = RequestInit & {
  searchParams?: URLSearchParams | Record<string, string>;
};

/**
 * Thin wrapper for anonymous Medusa store reads.
 * Prepends the resolved backend base URL and attaches the publishable key +
 * JSON accept header, while leaving caching (`next`/`cache`) and error handling
 * to the caller. Returns the raw Response so each consumer keeps its own
 * ok-check and parse semantics.
 */
export function medusaFetch(
  path: string,
  init: MedusaFetchInit = {},
): Promise<Response> {
  const { searchParams, headers, ...rest } = init;

  const qs = searchParams
    ? `?${
        searchParams instanceof URLSearchParams
          ? searchParams.toString()
          : new URLSearchParams(searchParams).toString()
      }`
    : "";

  return fetch(`${resolveMedusaBaseUrl()}${path}${qs}`, {
    ...rest,
    headers: {
      accept: "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
      ...headers,
    },
  });
}
