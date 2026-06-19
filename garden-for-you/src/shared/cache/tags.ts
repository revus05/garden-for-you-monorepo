export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  siteConfig: "site-config",
  reviews: "store-reviews",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

const PRODUCT_HANDLE_TAG_PREFIX = "product-handle-";

export const productHandleTag = (handle: string): string =>
  `${PRODUCT_HANDLE_TAG_PREFIX}${handle}`;

export const KNOWN_TAGS = new Set<string>(Object.values(CACHE_TAGS));

export const isKnownTag = (tag: string): boolean =>
  KNOWN_TAGS.has(tag) || tag.startsWith(PRODUCT_HANDLE_TAG_PREFIX);
