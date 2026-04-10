import type { Metadata } from "next";
export { default } from "@/pages/about-us";

export const metadata: Metadata = {
  title: "О нас",
  description:
    "Узнайте больше об интернет-магазине Сад Для Вас — наша история, миссия и ценности. Мы помогаем создавать красивые сады и зелёные уголки дома.",
  openGraph: {
    title: "О нас — Сад Для Вас",
    description:
      "Узнайте больше об интернет-магазине Сад Для Вас — наша история, миссия и ценности.",
  },
  alternates: {
    canonical: "/about-us",
  },
};
