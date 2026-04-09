import { Search } from "lucide-react";
import type { FC } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/ui";

type CatalogSearchProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

export const CatalogSearch: FC<CatalogSearchProps> = ({
  setSearchQuery,
  searchQuery,
}) => (
  <InputGroup>
    <InputGroupAddon align="inline-start">
      <Search />
    </InputGroupAddon>
    <InputGroupInput
      id="products-search"
      placeholder="Поиск"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </InputGroup>
);
