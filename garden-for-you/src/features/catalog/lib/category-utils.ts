import type { StoreProductCategory } from "@medusajs/types";

export function getFilteredCategories(
  activeTab: "seedlings" | "fertilizer",
  selectedIds: string[],
  categories: StoreProductCategory[],
): string[] {
  const idSet = new Set<string>();

  if (selectedIds.length > 0) {
    return selectedIds;
  }

  const parentCategory = categories.find(
    (category) => category.handle === activeTab,
  );

  if (!parentCategory) {
    return [];
  }

  parentCategory.category_children.forEach((category) => {
    idSet.add(category.id);
  });

  return Array.from(idSet);
}
