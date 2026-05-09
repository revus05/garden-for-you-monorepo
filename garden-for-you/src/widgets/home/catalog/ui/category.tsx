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
  depth?: number;
};

export const CatalogCategory: FC<CatalogCategoryProps> = ({
  category,
  selectedCategoryIds,
  setSelectedCategoryIds,
  depth = 0,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = !!category.category_children?.length;

  const handleCheckedChange = (categoryId: string, state: CheckedState) => {
    setSelectedCategoryIds((current) =>
      state
        ? current.includes(categoryId)
          ? current
          : [...current, categoryId]
        : current.filter((id) => id !== categoryId),
    );
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        <Field
          orientation="horizontal"
          className="max-w-[calc(100%-16px)]"
          style={{ paddingLeft: depth * 24 }}
        >
          <Checkbox
            id={`product-category-${category.id}`}
            name="product-category"
            checked={selectedCategoryIds.includes(category.id)}
            onCheckedChange={(state) => handleCheckedChange(category.id, state)}
          />
          <Label
            htmlFor={`product-category-${category.id}`}
            className={cn(
              "block truncate w-full leading-5",
              depth === 0 &&
                "uppercase font-bold tracking-wide text-secondary-foreground",
            )}
          >
            {category.name}
          </Label>
        </Field>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isOpen ? "Свернуть" : "Развернуть"}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                !isOpen && "-rotate-90",
              )}
            />
          </button>
        )}
      </div>

      {hasChildren && (
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-in-out",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-2 pt-2">
              {category.category_children!.map((child) => (
                <CatalogCategory
                  key={child.id}
                  category={child}
                  selectedCategoryIds={selectedCategoryIds}
                  setSelectedCategoryIds={setSelectedCategoryIds}
                  depth={depth + 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
