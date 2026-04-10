export { default } from "@/pages/privacy-policy";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Политика конфиденциальности интернет-магазина Сад Для Вас. Правила обработки персональных данных.",
  robots: {
    index: true,
    follow: false,
  },
  alternates: {
    canonical: "/privacy-policy",
  },
};
