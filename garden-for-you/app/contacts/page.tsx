import type { Metadata } from "next";
export { default } from "@/pages/contacts";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Свяжитесь с нами — адрес, телефон, email и время работы интернет-магазина Сад Для Вас. Мы всегда рады помочь с выбором растений.",
  openGraph: {
    title: "Контакты — Сад Для Вас",
    description:
      "Свяжитесь с нами — адрес, телефон, email и время работы интернет-магазина.",
  },
  alternates: {
    canonical: "/contacts",
  },
};
