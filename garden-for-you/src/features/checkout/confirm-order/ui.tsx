"use client";

import { useEffect } from "react";
import { ShieldCheck, Truck, MapPin } from "lucide-react";
import { formatPrice, useAppSelector } from "@/shared/lib";
import { Button, Separator } from "@/shared/ui";
import { useConfirmOrder } from "./model";
import { OrderReceipt } from "./order-receipt";
import type { ShippingOption } from "@/features/checkout/shipping-form";

type Props = {
  shippingOption: ShippingOption;
  onOrderPlaced?: () => void;
};

export function ConfirmOrderForm({ shippingOption, onOrderPlaced }: Props) {
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const { placeOrder, isLoading, receiptData } = useConfirmOrder(shippingOption);
  const deliveryPrice = shippingOption.amount;
  const itemsTotal = cart?.total ?? 0;
  const grandTotal = itemsTotal + deliveryPrice;

  useEffect(() => {
    if (receiptData) {
      onOrderPlaced?.();
    }
  }, [receiptData]);

  if (receiptData) {
    return <OrderReceipt receipt={receiptData} />;
  }

  return (
    <div className="mt-2 flex flex-col gap-6">
      <div className="rounded-xl border border-border/60 bg-background-secondary/30 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">
          Состав заказа
        </p>
        <div className="flex flex-col gap-2">
          {cart?.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4"
            >
              <span className="max-w-[16rem] text-sm leading-5 text-muted-foreground">
                {item.product_title}
                {(item.variant as any)?.options?.length > 0 && (
                  <span className="block text-xs text-muted-foreground/80">
                    {(item.variant as any).options
                      .map((o: any) =>
                        o.option?.title ? `${o.option.title}: ${o.value}` : o.value,
                      )
                      .join(", ")}
                  </span>
                )}
                <span className="block text-xs uppercase text-muted-foreground/70">
                  {formatPrice(item.unit_price)} × {item.quantity}
                </span>
              </span>
              <span className="text-sm font-semibold">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Товары</span>
            <span className="font-medium">{formatPrice(itemsTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Доставка</span>
            <span className="font-medium">
              {deliveryPrice === 0 ? "Бесплатно" : formatPrice(deliveryPrice)}
            </span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between text-base font-semibold">
            <span>К оплате</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-background-secondary/30 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {shippingOption.type_code === "delivery" ? (
            <Truck className="h-4 w-4 shrink-0 stroke-primary" />
          ) : (
            <MapPin className="h-4 w-4 shrink-0 stroke-primary" />
          )}
          <span>
            {shippingOption.name}
            {deliveryPrice > 0 && ` — ${formatPrice(deliveryPrice)}`}
            {deliveryPrice === 0 && " — бесплатно"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 stroke-primary" />
          <span>
            Оплата при получении — менеджер свяжется для подтверждения заказа
          </span>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={placeOrder}
        disabled={isLoading}
      >
        {isLoading ? "Оформляем заказ..." : "Подтвердить заказ"}
      </Button>
    </div>
  );
}
