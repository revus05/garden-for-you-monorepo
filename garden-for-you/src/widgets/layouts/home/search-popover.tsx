"use client";

import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCatalogProductsInfiniteQuery } from "@/features/catalog";
import plantPlaceholder from "@/images/plant-placholder.svg";
import { paths } from "@/shared/constants/navigation";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@/shared/ui";

export const SearchPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery.trim());
  const inputRef = useRef<HTMLInputElement>(null);

  const productsQuery = useCatalogProductsInfiniteQuery({
    categoryIds: [],
    searchQuery: deferredQuery,
    orderBy: "title",
  });

  const products =
    productsQuery.data?.pages.flatMap((page) => page.products) ?? [];

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Поиск">
          <Search />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[95vw] lg:translate-x-0 translate-x-[2.5vw] max-w-[800px] z-50 bg-background shadow-2xl flex flex-col rounded-3xl border-none p-0"
        align="end"
        sideOffset={0}
      >
        <div className="flex items-center gap-3 py-4 border-b px-4">
          <Search className="text-muted-foreground shrink-0 size-5" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label="Закрыть"
          >
            <X />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 py-2">
          {!deferredQuery && (
            <p className="py-6 text-center text-muted-foreground">
              Введите запрос для поиска товаров
            </p>
          )}
          {productsQuery.isPending && deferredQuery && (
            <p className="py-6 text-center text-muted-foreground">
              Загрузка...
            </p>
          )}
          {!productsQuery.isPending &&
            deferredQuery &&
            products.length === 0 && (
              <p className="py-6 text-center text-muted-foreground">
                По запросу «{deferredQuery}» ничего не найдено
              </p>
            )}

          <div className="flex flex-col divide-y">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`${paths.productPage}/${product.handle}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 py-3 px-2 hover:bg-accent rounded-lg transition-colors"
              >
                <div className="size-14 shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                  {product.thumbnail ? (
                    <Image
                      src={product.thumbnail}
                      alt={product.title ?? ""}
                      width={56}
                      height={56}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Image
                      src={plantPlaceholder.src}
                      alt={product.title ?? ""}
                      width={40}
                      height={40}
                      className="w-[70%] object-contain"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.title}</p>
                  {product.variants?.[0]?.calculated_price && (
                    <p className="text-sm text-muted-foreground">
                      {product.variants[0].calculated_price.calculated_amount?.toFixed(
                        2,
                      )}{" "}
                      {product.variants[0].calculated_price.currency_code?.toUpperCase()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
