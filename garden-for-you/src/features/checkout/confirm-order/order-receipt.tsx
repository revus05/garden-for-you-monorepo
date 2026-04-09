"use client";

import { CheckCircle2, Download, MapPin, Truck } from "lucide-react";
import { useRef } from "react";
import { formatPrice } from "@/shared/lib";
import { Button, Separator } from "@/shared/ui";
import type { OrderReceiptData } from "./model";

type Props = {
  receipt: OrderReceiptData;
};

export function OrderReceipt({ receipt }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);

  function handleDownloadPdf() {
    window.print();
  }

  const deliveryPrice = receipt.shippingOption.amount;

  return (
    <>
      {/* Print styles — only receipt visible during print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #order-receipt-printable,
          #order-receipt-printable * {
            visibility: visible !important;
          }
          #order-receipt-printable {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            max-width: 640px !important;
            margin: 0 auto !important;
            padding: 32px !important;
            background: white !important;
            color: black !important;
            font-family: sans-serif !important;
            font-size: 13px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Success banner */}
      <div className="no-print flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="h-12 w-12 stroke-primary" />
        <div>
          <p className="text-xl font-bold">Заказ оформлен!</p>
          <p className="text-sm text-muted-foreground">
            Менеджер свяжется с вами для подтверждения
          </p>
        </div>
      </div>

      {/* Receipt */}
      <div
        id="order-receipt-printable"
        ref={receiptRef}
        className="rounded-xl border border-border/60 bg-muted/30 p-5 flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold leading-tight">
              Чек заказа #{receipt.displayId}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {receipt.date}
            </p>
          </div>
          <span className="text-xs bg-primary/10 text-primary font-semibold rounded-full px-3 py-1 whitespace-nowrap">
            Garden for You
          </span>
        </div>

        <Separator />

        {/* Items */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Состав заказа
          </p>
          <div className="flex flex-col gap-2.5">
            {receipt.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">
                    {item.productTitle}
                  </p>
                  {item.variantOptions && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.variantOptions}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {formatPrice(item.unitPrice)} × {item.quantity} шт.
                  </p>
                </div>
                <p className="text-sm font-semibold shrink-0">
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Товары</span>
            <span>{formatPrice(receipt.itemsTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Доставка</span>
            <span>
              {deliveryPrice === 0 ? "Бесплатно" : formatPrice(deliveryPrice)}
            </span>
          </div>
          <Separator className="my-0.5" />
          <div className="flex justify-between text-base font-bold">
            <span>К оплате</span>
            <span>{formatPrice(receipt.grandTotal)}</span>
          </div>
        </div>

        <Separator />

        {/* Shipping */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Способ получения
          </p>
          <div className="flex items-center gap-2 text-sm">
            {receipt.shippingOption.type_code === "delivery" ? (
              <Truck className="h-4 w-4 shrink-0 stroke-primary" />
            ) : (
              <MapPin className="h-4 w-4 shrink-0 stroke-primary" />
            )}
            <span>
              {receipt.shippingOption.name}
              {deliveryPrice > 0 && ` — ${formatPrice(deliveryPrice)}`}
              {deliveryPrice === 0 && " — бесплатно"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Оплата при получении</p>
        </div>
      </div>

      {/* Actions */}
      <div className="no-print flex flex-col gap-2 mt-2">
        <Button size="lg" className="w-full gap-2" onClick={handleDownloadPdf}>
          <Download className="size-4 stroke-primary-foreground " />
          Скачать PDF-чек
        </Button>
      </div>
    </>
  );
}
