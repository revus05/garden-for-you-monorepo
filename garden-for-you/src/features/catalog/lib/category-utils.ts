import type { StoreProductCategory } from "@medusajs/types";

export function findCategoryInTree(
  categories: StoreProductCategory[],
  id: string,
): StoreProductCategory | undefined {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    if (cat.category_children) {
      const found = findCategoryInTree(cat.category_children, id);
      if (found) return found;
    }
  }
  return undefined;
}
