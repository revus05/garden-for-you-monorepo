import type { FC } from "react";
import type { ProductCategoryOrder } from "@/entities/product";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";

type CatalogSortingProps = {
  orderBy: ProductCategoryOrder;
  setOrderBy: (orderBy: ProductCategoryOrder) => void;
};

export const CatalogSorting: FC<CatalogSortingProps> = ({
  orderBy,
  setOrderBy,
}) => (
  <Select
    value={orderBy}
    onValueChange={(orderBy) => setOrderBy(orderBy as ProductCategoryOrder)}
  >
    <SelectTrigger className="w-full md:max-w-48 md:justify-self-end">
      <SelectValue placeholder="Сортировка" />
    </SelectTrigger>
    <SelectContent position="popper">
      <SelectGroup>
        <SelectLabel>Сортировать по</SelectLabel>
        <SelectItem value="title">По алфавиту ↓</SelectItem>
        <SelectItem value="-title">По алфавиту ↑</SelectItem>
        <SelectItem value="-created_at">Сначала новые</SelectItem>
        <SelectItem value="created_at">Сначала старые</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);
