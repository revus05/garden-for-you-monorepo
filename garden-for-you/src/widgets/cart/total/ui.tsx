"use client";

import { formatPrice } from "shared/lib/format-price";
import { useAppSelector } from "shared/lib/hooks";
import { Button } from "shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "shared/ui/card";
import { Separator } from "shared/ui/separator";

export const CartTotal = () => {
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const deliveryPrice = 15;
  const itemsTotal = cart?.total ?? 0;
  const grandTotal = itemsTotal + deliveryPrice;

  if (!cart || !cart?.items?.length) {
    return null;
  }

  return (
    <Card className="w-full md:w-96 bg-card/95 lg:sticky lg:top-24">
      <CardHeader className="gap-2 border-b border-border/60">
        <CardTitle className="text-xl font-semibold">Итого</CardTitle>
        <CardDescription>
          Сводка по заказу с учетом фиксированной доставки.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {cart?.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4"
            >
              <span className="max-w-[16rem] text-sm leading-5 text-muted-foreground">
                {item.product_title}
                <span className="block text-xs uppercase text-muted-foreground/80">
                  {formatPrice(item.unit_price)} x {item.quantity}
                </span>
              </span>
              <span className="text-sm font-semibold text-foreground">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex flex-col gap-2 rounded-xl bg-muted/40">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Товары</span>
            <span className="font-medium">{formatPrice(itemsTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Доставка</span>
            <span className="font-medium">{formatPrice(deliveryPrice)}</span>
          </div>
          <Separator className="bg-border/80" />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">К оплате</p>
              <p className="text-xs uppercase text-muted-foreground/70">
                С учетом доставки
              </p>
            </div>
            <span className="text-2xl font-semibold text-foreground">
              {formatPrice(grandTotal)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg">
          Перейти к оформлению
        </Button>
      </CardFooter>
    </Card>
  );
};
