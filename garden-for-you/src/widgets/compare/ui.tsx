"use client";

import { ArrowRight, Scale, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ComparisonProduct } from "@/entities/comparison";
import {
  clearComparisonWithSync,
  removeFromComparisonWithSync,
} from "@/features/comparison";
import leavesBg1 from "@/images/leaves-bg-1.png";
import leavesBg2 from "@/images/leaves-bg-2.png";
import { paths } from "@/shared/constants/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/lib";
import { Badge, Button } from "@/shared/ui";

function collectAllSpecs(products: ComparisonProduct[]) {
  const seen = new Map<
    string,
    { id: string; name: string; unit: string | null }
  >();
  for (const product of products) {
    for (const spec of product.specs) {
      if (!seen.has(spec.definition.key)) {
        seen.set(spec.definition.key, {
          id: spec.definition.id,
          name: spec.definition.name,
          unit: spec.definition.unit,
        });
      }
    }
  }
  return Array.from(seen.entries()).map(([key, def]) => ({ key, ...def }));
}

function getSpecValue(
  product: ComparisonProduct,
  specKey: string,
): string | null {
  const spec = product.specs.find((s) => s.definition.key === specKey);
  if (!spec) return null;
  return spec.definition.unit
    ? `${spec.value} ${spec.definition.unit}`
    : spec.value;
}

function hasDifference(
  products: ComparisonProduct[],
  specKey: string,
): boolean {
  const values = products.map((p) => getSpecValue(p, specKey));
  const nonNull = values.filter((v) => v !== null);
  if (nonNull.length < 2) return false;
  return new Set(nonNull).size > 1;
}

export const CompareWidget = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.comparisonSlice.products);
  const allSpecs = collectAllSpecs(products);
  const currentIds = products.map((p) => p.id);

  const handleRemove = (productId: string) => {
    void removeFromComparisonWithSync(
      dispatch,
      productId,
      currentIds.filter((id) => id !== productId),
    );
  };

  const handleClear = () => {
    void clearComparisonWithSync(dispatch);
  };

  if (products.length === 0) {
    return (
      <div className="wrapper py-16 flex flex-col items-center gap-6 text-center">
        <div className="size-24 rounded-full bg-muted flex items-center justify-center">
          <Scale className="size-10 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Нет товаров для сравнения</h1>
          <p className="text-muted-foreground max-w-sm">
            Добавьте товары к сравнению на страницах товаров, чтобы увидеть их
            характеристики рядом.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href={paths.home}>Перейти к товарам</Link>
        </Button>
      </div>
    );
  }

  const hasDiffs = allSpecs.some((s) => hasDifference(products, s.key));

  return (
    <div className="wrapper py-8 flex flex-col gap-6">
      <div className="flex justify-between gap-4 sm:flex-row items-start flex-col">
        <div className="flex items-center gap-3">
          <Scale className="size-6 text-primary shrink-0" />
          <h1 className="text-2xl font-bold">Сравнение товаров</h1>
          <Badge>{products.length} из 4</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground shrink-0"
          onClick={handleClear}
        >
          <Trash2 className="size-4 mr-1" />
          Очистить всё
        </Button>
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 z-20 bg-background min-w-40 w-40 p-4 text-left border-r border-border">
                <span className="text-sm text-muted-foreground font-normal">
                  Характеристика
                </span>
              </th>

              {products.map((product) => (
                <th
                  key={product.id}
                  className="min-w-50 p-4 text-center align-top bg-background"
                >
                  <div className="flex flex-col items-center gap-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemove(product.id)}
                      className="absolute top-0 right-0 size-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Удалить из сравнения"
                    >
                      <X className="size-3.5" />
                    </button>

                    <Link href={`${paths.productPage}/${product.handle}`}>
                      <div className="size-28 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center hover:border-primary transition-colors">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.title}
                            width={112}
                            height={112}
                            className="object-cover size-full"
                          />
                        ) : (
                          <span className="text-4xl select-none">🌿</span>
                        )}
                      </div>
                    </Link>

                    <Link
                      href={`${paths.productPage}/${product.handle}`}
                      className="text-sm font-semibold leading-tight hover:text-primary transition-colors line-clamp-2 text-center px-4"
                    >
                      {product.title}
                    </Link>

                    {product.price !== null && (
                      <span className="text-base font-bold text-primary">
                        {product.price.toFixed(2)} {product.currency}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {products.length < 2 && (
                <th>
                  <Link href={paths.home}>
                    <Button>
                      Еще товары
                      <ArrowRight className="stroke-primary-foreground" />
                    </Button>
                  </Link>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {allSpecs.length === 0 ? (
              <tr>
                <td
                  colSpan={products.length + 1}
                  className="p-6 text-center text-muted-foreground text-sm"
                >
                  У выбранных товаров нет характеристик
                </td>
              </tr>
            ) : (
              allSpecs.map((spec, idx) => {
                const isDifferent = hasDifference(products, spec.key);
                return (
                  <tr
                    key={spec.key}
                    className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}
                  >
                    <td className="sticky left-0 z-10 p-4 text-sm font-medium text-muted-foreground border-r border-border bg-inherit">
                      <div className="flex items-center gap-2">
                        {isDifferent && (
                          <span
                            className="size-1.5 rounded-full bg-primary shrink-0"
                            title="Значения отличаются"
                          />
                        )}
                        {spec.name}
                      </div>
                    </td>

                    {products.map((product) => {
                      const value = getSpecValue(product, spec.key);
                      return (
                        <td
                          key={product.id}
                          className={`p-4 text-sm text-center align-middle ${
                            isDifferent ? "font-semibold" : ""
                          }`}
                        >
                          {value ?? (
                            <span className="text-muted-foreground/40 select-none">
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex gap-3 overflow-x-auto pb-1">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col items-center gap-2 min-w-28 relative"
          >
            <button
              type="button"
              onClick={() => handleRemove(product.id)}
              className="absolute top-0 right-0 z-10 size-5 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Удалить из сравнения"
            >
              <X className="size-3" />
            </button>
            <Link href={`${paths.productPage}/${product.handle}`}>
              <div className="size-20 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center hover:border-primary transition-colors">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    width={80}
                    height={80}
                    className="object-cover size-full"
                  />
                ) : (
                  <span className="text-2xl select-none">🌿</span>
                )}
              </div>
            </Link>
            <Link
              href={`${paths.productPage}/${product.handle}`}
              className="text-xs font-medium leading-tight hover:text-primary transition-colors line-clamp-2 text-center w-full"
            >
              {product.title}
            </Link>
            {product.price !== null && (
              <span className="text-xs font-bold text-primary">
                {product.price.toFixed(2)} {product.currency}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {allSpecs.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-6">
            У выбранных товаров нет характеристик
          </p>
        ) : (
          allSpecs.map((spec, idx) => {
            const isDifferent = hasDifference(products, spec.key);
            return (
              <div
                key={spec.key}
                className={`rounded-xl border border-border p-4 flex flex-col gap-3 ${
                  idx % 2 === 0 ? "bg-background" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isDifferent && (
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  )}
                  <span className="text-sm font-semibold text-muted-foreground">
                    {spec.name}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {products.map((product) => {
                    const value = getSpecValue(product, spec.key);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <Link
                          href={`${paths.productPage}/${product.handle}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-1 shrink min-w-0"
                        >
                          {product.title}
                        </Link>
                        <span
                          className={`text-sm shrink-0 ${
                            isDifferent
                              ? "font-semibold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {value ?? (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {hasDiffs && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary inline-block" />
          Характеристики, по которым товары отличаются
        </p>
      )}
    </div>
  );
};
