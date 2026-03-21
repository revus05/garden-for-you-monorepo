import type { HttpTypes } from "@medusajs/types";

export type Product = HttpTypes.StoreProduct;
export type ProductCategory = HttpTypes.StoreProductCategory;

export type ProductCategoryOrder =
  | "-created_at"
  | "created_at"
  | "-title"
  | "title";

export type CatalogFilters = {
  categoryIds: string[];
  searchQuery: string;
  orderBy: ProductCategoryOrder;
};

export type CatalogProductsPage = {
  products: Product[];
  count: number;
  nextOffset?: number;
};
