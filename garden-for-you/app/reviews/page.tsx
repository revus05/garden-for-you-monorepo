import type { Metadata } from "next";
import ReviewsPage from "@/pages/reviews";

export const metadata: Metadata = {
  title: "Отзывы покупателей",
  description:
    "Отзывы покупателей интернет-магазина Сад Для Вас. Узнайте, что говорят наши клиенты о качестве растений и уровне сервиса.",
  openGraph: {
    title: "Отзывы покупателей — Сад Для Вас",
    description:
      "Отзывы покупателей интернет-магазина Сад Для Вас о качестве растений и сервисе.",
  },
  alternates: {
    canonical: "/reviews",
  },
};

export default function ReviewsPageRoute() {
  return <ReviewsPage />;
}
