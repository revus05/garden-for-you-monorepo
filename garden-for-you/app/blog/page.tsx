import type { Metadata } from "next";
export { default } from "@/pages/blog";

export const metadata: Metadata = {
  title: "Блог",
  description:
    "Советы по уходу за растениями, идеи для сада и дома, новости магазина. Полезные статьи для любителей садоводства и комнатных растений.",
  openGraph: {
    title: "Блог о садоводстве — Сад Для Вас",
    description:
      "Советы по уходу за растениями, идеи для сада и дома, новости магазина.",
  },
  alternates: {
    canonical: "/blog",
  },
};
