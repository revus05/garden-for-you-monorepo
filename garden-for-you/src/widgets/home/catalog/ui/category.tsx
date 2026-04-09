"use client";

import type { StoreProductCategory } from "@medusajs/types";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { ChevronDown } from "lucide-react";
import { type Dispatch, type FC, type SetStateAction, useState } from "react";
import { cn } from "@/shared/lib";
import { Checkbox, Field, Label } from "@/shared/ui";

type CatalogCategoryProps = {
  category: StoreProductCategory;
  selectedCategoryIds: string[];
  setSelectedCategoryIds: Dispatch<SetStateAction<string[]>>;
};

export const CatalogCategory: FC<CatalogCategoryProps> = ({
  category,
  selectedCategoryIds,
  setSelectedCategoryIds,
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );

  const isCollapsed = collapsedCategories.has(category.id);
  const hasChildren = !!category.category_children?.length;

  const handleCategoryCheckedChange = (
    categoryId: string,
    state: CheckedState,
  ) => {
    setSelectedCategoryIds((current) =>
      state
        ? current.includes(categoryId)
          ? current
          : [...current, categoryId]
        : current.filter((id) => id !== categoryId),
    );
  };

  return (
    <div key={category.id} className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Field orientation="horizontal" className="max-w-[calc(100%-16px)]">
          <Checkbox
            id={`product-category-${category.id}`}
            name="product-category"
            checked={selectedCategoryIds.includes(category.id)}
            onCheckedChange={(state) =>
              handleCategoryCheckedChange(category.id, state)
            }
          />
          <Label
            htmlFor={`product-category-${category.id}`}
            className="block truncate w-full leading-5"
          >
            {category.name}
          </Label>
        </Field>
        {hasChildren && (
          <button
            type="button"
            onClick={() =>
              setCollapsedCategories((prev) => {
                const next = new Set(prev);
                if (next.has(category.id)) {
                  next.delete(category.id);
                } else {
                  next.add(category.id);
                }
                return next;
              })
            }
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isCollapsed ? "Развернуть" : "Свернуть"}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                isCollapsed && "-rotate-90",
              )}
            />
          </button>
        )}
      </div>

      {!isCollapsed &&
        category.category_children?.map((child) => (
          <Field
            orientation="horizontal"
            key={child.id}
            className="max-w-full pl-6"
          >
            <Checkbox
              id={`product-category-${child.id}`}
              name="product-category"
              checked={selectedCategoryIds.includes(child.id)}
              onCheckedChange={(state) =>
                handleCategoryCheckedChange(child.id, state)
              }
            />
            <Label
              htmlFor={`product-category-${child.id}`}
              className="block truncate w-full leading-5"
            >
              {child.name}
            </Label>
          </Field>
        ))}
    </div>
  );
};
