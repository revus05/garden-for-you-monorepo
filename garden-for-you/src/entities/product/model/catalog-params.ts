/**
 * Single source of truth for the category-list request. Shared by the client
 * fetcher and the cached server fetcher so SSR-hydrated data and a client
 * refetch cannot diverge.
 */
export const CATALOG_CATEGORY_LIST_PARAMS = {
  limit: 200,
  include_descendants_tree: true,
  fields: "id,category_children,handle,name",
} as const;
