"use client";

import { Button } from "shared/ui/button";

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

const NEXT_PUBLIC_REGION_ID = requiredEnv(
  "NEXT_PUBLIC_REGION_ID",
  process.env.NEXT_PUBLIC_REGION_ID,
);

import type { HttpTypes } from "@medusajs/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createSdk } from "shared/lib/sdk";
import { Badge } from "shared/ui/badge";
import { Icons } from "shared/ui/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "shared/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "shared/ui/select";

export const Catalog = () => {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const limit = 20;

  useEffect(() => {
    if (!loading) return;

    const offset = (page - 1) * limit;

    const sdk = createSdk();

    sdk.store.product
      .list({
        limit,
        offset,
        region_id: NEXT_PUBLIC_REGION_ID,
      })
      .then(({ products: newProducts, count }) => {
        setProducts((prev) => {
          if (prev.length > offset) return prev;
          return [...prev, ...newProducts];
        });
        setHasMore(count > limit * page);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [loading, page]);

  const loadMore = () => {
    setPage((p) => p + 1);
    setLoading(true);
  };

  const [categories, setCategories] = useState<
    HttpTypes.StoreProductCategory[]
  >([]);

  useEffect(() => {
    const getCategories = async () => {
      const sdk = createSdk();

      const { product_categories } = await sdk.store.category.list({
        limit: 100,
      });

      setCategories(product_categories);
    };

    void getCategories();
  }, []);

  return (
    <section>
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <h2 className="text-2xl font-bold">Каталог</h2>
          {products.length > 0 && (
            <Badge>{products.length} товара найдено</Badge>
          )}
        </div>
        <Select>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Сортировка" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              <SelectLabel>Сортировать по</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-4 min-w-72">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Icons.search />
            </InputGroupAddon>
            <InputGroupInput id="products-search" placeholder="Поиск" />
          </InputGroup>

          <div className="flex flex-col">
            {categories.map((item) => (
              <span key={item.id}>{item.name}</span>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {loading && products.length === 0 && <p>Загрузка...</p>}
          {products.length === 0 && !loading && <p>Товаров не найдено</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                {product.thumbnail && (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover rounded"
                  />
                )}
                <h3 className="font-semibold mt-3">{product.title}</h3>
                <p className="text-sm text-gray-600">
                  {product.description?.slice(0, 100)}...
                </p>

                {product.variants?.[0]?.calculated_price && (
                  <p className="text-lg font-bold mt-2">
                    {product.variants[0].calculated_price.calculated_amount}{" "}
                    {product.variants[0].calculated_price.currency_code?.toUpperCase()}
                  </p>
                )}
              </div>
            ))}
          </div>

          {hasMore && (
            <Button
              onClick={loadMore}
              disabled={loading}
              className="mt-8 block mx-auto bg-black text-white px-6 py-3 rounded"
            >
              {loading ? "Загрузка..." : "Загрузить ещё"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
