import type { Metadata } from "next";
export { default } from "@/pages/contacts";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Свяжитесь с нами — адрес, телефон, email и время работы питомника Сад Для Вас. Мы всегда рады помочь с выбором растений.",
  openGraph: {
    title: "Контакты — Сад Для Вас",
    description:
      "Свяжитесь с нами — адрес, телефон, email и время работы питомника.",
  },
  alternates: {
    canonical: "/contacts",
  },
};
