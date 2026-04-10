import type { Metadata } from "next";
export { default } from "@/pages/offer-agreement";

export const metadata: Metadata = {
  title: "Договор-оферта",
  description:
    "Публичная оферта интернет-магазина Сад Для Вас. Условия договора купли-продажи товаров.",
  robots: {
    index: true,
    follow: false,
  },
  alternates: {
    canonical: "/offer-agreement",
  },
};
