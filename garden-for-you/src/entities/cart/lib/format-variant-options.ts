import type { HttpTypes } from "@medusajs/types";

type LineItemVariantOption = {
  value?: string | null;
  option?: { title?: string | null } | null;
};

/**
 * Cart line items are requested with `+items.variant.options.value` and
 * `+items.variant.options.option.title`, which the generated Medusa store types
 * do not model — hence the local shape instead of an `any` cast at each call
 * site.
 */
export function formatVariantOptions(
  item: HttpTypes.StoreCartLineItem,
): string {
  const options = (
    item.variant as { options?: LineItemVariantOption[] } | null | undefined
  )?.options;

  if (!options?.length) return "";

  return options
    .map((option) =>
      option.option?.title
        ? `${option.option.title}: ${option.value}`
        : option.value,
    )
    .filter(Boolean)
    .join(", ");
}
