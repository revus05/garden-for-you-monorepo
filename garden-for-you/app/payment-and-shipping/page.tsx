import type { Metadata } from "next";
export { default } from "@/pages/payment-and-shipping";

export const metadata: Metadata = {
  title: "Оплата и доставка",
  description:
    "Условия оплаты и доставки заказов в интернет-магазине Сад Для Вас. Доставка растений по всей Беларуси — быстро и бережно.",
  openGraph: {
    title: "Оплата и доставка — Сад Для Вас",
    description:
      "Условия оплаты и доставки заказов. Доставка растений по всей Беларуси.",
  },
  alternates: {
    canonical: "/payment-and-shipping",
  },
};
