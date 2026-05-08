import type { StoreProductCategory } from "@medusajs/types";

function collectDescendantIds(category: StoreProductCategory): string[] {
  const ids = [category.id];
  for (const child of category.category_children ?? []) {
    ids.push(...collectDescendantIds(child));
  }
  return ids;
}

export function getFilteredCategories(
  activeTab: "seedlings" | "fertilizer",
  selectedIds: string[],
  categories: StoreProductCategory[],
): string[] {
  if (selectedIds.length > 0) {
    return selectedIds;
  }

  const parentCategory = categories.find(
    (category) => category.handle === activeTab,
  );

  if (!parentCategory) {
    return [];
  }

  return parentCategory.category_children
    .flatMap(collectDescendantIds)
    .sort();
}

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
