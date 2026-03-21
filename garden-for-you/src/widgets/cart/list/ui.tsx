"use client";

import { removeCartItem, updateCartItemQuantity } from "features/cart";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { paths } from "shared/constants/navigation";
import { formatPrice } from "shared/lib/format-price";
import { useAppDispatch, useAppSelector } from "shared/lib/hooks";
import { Button } from "shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "shared/ui/table";

export const CartList = () => {
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const dispatch = useAppDispatch();

  if (!cart || !cart?.items?.length) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <p className="text-secondary-foreground/70">Нет товаров в корзине</p>
        <Button className="w-fit" asChild>
          <Link href={paths.home}>В каталог</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-card/95 gap-0">
      <CardHeader className="gap-1 border-b border-border/60">
        <CardTitle className="text-xl font-semibold">Корзина</CardTitle>
        <CardDescription>
          Проверьте состав заказа перед оформлением.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:hidden">
          {cart?.items?.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border/60 bg-muted/20 p-4"
            >
              <div className="flex gap-3">
                {item.thumbnail && (
                  <Link
                    href={`${paths.productPage}/${item.product_handle}`}
                    className="shrink-0"
                  >
                    <Image
                      src={item.thumbnail}
                      width={80}
                      height={80}
                      alt={item.product_title || ""}
                      className="rounded-2xl border border-border/50 object-cover"
                    />
                  </Link>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      className="font-medium text-foreground hover:underline break-words"
                      href={`${paths.productPage}/${item.product_handle}`}
                    >
                      {item.product_title}
                    </Link>

                    <Button
                      size="icon"
                      variant="outline"
                      className="size-9 shrink-0 border-border/60 bg-background/80"
                      onClick={() => removeCartItem(dispatch, item.id)}
                    >
                      <X />
                    </Button>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Цена:{" "}
                    <span className="font-medium text-foreground">
                      {formatPrice(item.unit_price)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Количество
                </span>

                <div className="flex w-fit items-center gap-2 rounded-xl border border-border/60 bg-muted/40 p-1">
                  <Button
                    size="icon"
                    disabled={item.quantity === 1}
                    onClick={() =>
                      updateCartItemQuantity(
                        dispatch,
                        item.id,
                        item.quantity - 1,
                      )
                    }
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    size="icon"
                    onClick={() =>
                      updateCartItemQuantity(
                        dispatch,
                        item.id,
                        item.quantity + 1,
                      )
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block">
          <Table className="min-w-180">
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead
                  colSpan={2}
                  className="h-12 uppercase tracking-[0.16em] text-muted-foreground"
                >
                  Наименование товара
                </TableHead>
                <TableHead className="h-12 uppercase tracking-[0.16em] text-muted-foreground">
                  Цена ед.
                </TableHead>
                <TableHead className="h-12 uppercase tracking-[0.16em] text-muted-foreground">
                  Кол-во
                </TableHead>
                <TableHead className="h-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart?.items?.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-border/60 hover:bg-muted/30"
                >
                  <TableCell className="lg:w-24 w-16">
                    {item.thumbnail && (
                      <Link
                        href={`${paths.productPage}/${item.product_handle}`}
                      >
                        <Image
                          src={item.thumbnail}
                          width={80}
                          height={80}
                          alt={item.product_title || ""}
                          className="rounded-2xl border border-border/50 object-cover"
                        />
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Link
                        className="font-medium text-foreground hover:underline"
                        href={`${paths.productPage}/${item.product_handle}`}
                      >
                        {item.product_title}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="w-40 font-medium">
                    {formatPrice(item.unit_price)}
                  </TableCell>
                  <TableCell className="w-44">
                    <div className="flex w-fit items-center gap-2 rounded-xl border border-border/60 bg-muted/40 p-1">
                      <Button
                        size="icon"
                        disabled={item.quantity === 1}
                        onClick={() =>
                          updateCartItemQuantity(
                            dispatch,
                            item.id,
                            item.quantity - 1,
                          )
                        }
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        onClick={() =>
                          updateCartItemQuantity(
                            dispatch,
                            item.id,
                            item.quantity + 1,
                          )
                        }
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="w-12">
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-border/60 bg-background/80"
                      onClick={() => removeCartItem(dispatch, item.id)}
                    >
                      <X />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
