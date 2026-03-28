import type { HttpTypes } from "@medusajs/types";

export type Product = HttpTypes.StoreProduct;
export type ProductCategory = HttpTypes.StoreProductCategory;

export type SpecDefinition = {
  id: string;
  name: string;
  key: string;
  unit: string | null;
  type: "text" | "number" | "boolean" | "select";
  options: string[] | null;
  sort_order: number;
};

export type ProductSpec = {
  id: string;
  product_id: string;
  definition_id: string;
  value: string;
  definition: SpecDefinition;
};

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
