"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/shared/lib";
import { resetCart } from "@/entities/cart";
import { completeOrderRequest } from "./api";
import type { ShippingOption } from "@/features/checkout/shipping-form";

export type OrderReceiptItem = {
  id: string;
  productTitle: string;
  variantOptions: string;
  unitPrice: number;
  quantity: number;
};

export type OrderReceiptData = {
  displayId: number;
  date: string;
  items: OrderReceiptItem[];
  shippingOption: ShippingOption;
  itemsTotal: number;
  grandTotal: number;
};

export const useConfirmOrder = (shippingOption: ShippingOption) => {
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<OrderReceiptData | null>(null);
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cartSlice.cart);

  async function placeOrder() {
    setIsLoading(true);
    try {
      const { order } = await completeOrderRequest();

      const items: OrderReceiptItem[] =
        cart?.items?.map((item) => {
          const variantOptions =
            (item.variant as any)?.options
              ?.map((o: any) =>
                o.option?.title ? `${o.option.title}: ${o.value}` : o.value,
              )
              .join(", ") ?? "";

          return {
            id: item.id,
            productTitle: item.product_title ?? "",
            variantOptions,
            unitPrice: item.unit_price,
            quantity: item.quantity,
          };
        }) ?? [];

      const itemsTotal = cart?.total ?? 0;
      const grandTotal = itemsTotal + shippingOption.amount;

      setReceiptData({
        displayId: order.display_id,
        date: new Date().toLocaleDateString("ru-BY", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        items,
        shippingOption,
        itemsTotal,
        grandTotal,
      });

      dispatch(resetCart());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Что-то пошло не так",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return { placeOrder, isLoading, receiptData };
};
