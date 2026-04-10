"use client";

import Link from "next/link";
import { paths } from "@/shared/constants/navigation";
import { formatPrice, useAppSelector } from "@/shared/lib";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "@/shared/ui";

export const CartTotal = () => {
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const user = useAppSelector((state) => state.userSlice.user);

  if (!cart || !cart?.items?.length) {
    return null;
  }

  const itemsTotal = cart.total ?? 0;

  const checkoutHref = user
    ? paths.checkout
    : `${paths.signIn}?path=${paths.checkout}`;

  return (
    <Card className="w-full md:w-96 bg-card/95 lg:sticky lg:top-24">
      <CardHeader className="gap-2 border-b border-border/60">
        <CardTitle className="text-xl font-semibold">Итого</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {cart.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4"
            >
              <div className="flex flex-col">
                <span className="max-w-[16rem] text-sm leading-5 text-muted-foreground">
                  {item.product_title}
                </span>
                <span className="max-w-[16rem] text-sm leading-5 text-muted-foreground">
                  {item.variant?.options?.[0].option?.title}-
                  {item.variant?.options?.[0].value}
                </span>
                <span className="block text-xs uppercase text-muted-foreground/80">
                  {formatPrice(item.unit_price)} x {item.quantity}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex flex-col gap-2 rounded-xl bg-background-secondary/40">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Товары</span>
            <span className="font-medium">{formatPrice(itemsTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Доставка</span>
            <span className="font-medium text-xs text-muted-foreground/80">
              уточняется при оформлении
            </span>
          </div>
          <Separator className="bg-border/80" />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Сумма товаров</p>
              <p className="text-xs uppercase text-muted-foreground/70">
                Без учёта доставки
              </p>
            </div>
            <span className="text-2xl font-semibold text-foreground">
              {formatPrice(itemsTotal)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" asChild>
          <Link href={checkoutHref}>Перейти к оформлению</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
