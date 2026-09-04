import type { Metadata } from "next";
import { EB_Garamond, Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "@/app/providers";
import { getServerCart } from "@/entities/cart/server";
import { readComparisonIds } from "@/entities/comparison/server";
import { getServerUser } from "@/entities/user/server";
import { publicEnv } from "@/shared/config/env";

const notoSans = Noto_Sans({ subsets: ["cyrillic"], variable: "--font-sans" });
const notoSerif = Noto_Serif({
  subsets: ["cyrillic"],
  variable: "--font-logo",
});
const ebGaramond = EB_Garamond({
  subsets: ["cyrillic"],
  variable: "--font-serif",
});

const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Сад Для Вас — питомник растений и товаров для сада",
    template: "%s | Сад Для Вас",
  },
  description:
    "Питомник растений, семян и товаров для сада в Беларуси. Широкий ассортимент комнатных и садовых растений с доставкой по всей стране.",
  keywords: [
    "растения",
    "сад",
    "комнатные растения",
    "садовые растения",
    "семена",
    "цветы",
    "Беларусь",
    "питомник",
    "купить растения",
    "доставка растений",
  ],
  authors: [{ name: "Сад Для Вас", url: siteUrl }],
  creator: "Сад Для Вас",
  publisher: "Сад Для Вас",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ru_BY",
    url: siteUrl,
    siteName: "Сад Для Вас",
    title: "Сад Для Вас — питомник растений и товаров для сада",
    description:
      "Питомник растений, семян и товаров для сада в Беларуси. Широкий ассортимент комнатных и садовых растений с доставкой по всей стране.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Сад Для Вас — питомник растений и товаров для сада",
    description:
      "Питомник растений, семян и товаров для сада в Беларуси.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // All three are cookie-driven: a visitor without an auth/cart cookie costs
  // zero backend round-trips here. `readComparisonIds` never hits the network —
  // the full comparison payload is loaded by the `/compare` page alone.
  const [preloadedCart, preloadedUser, preloadedComparisonIds] =
    await Promise.all([getServerCart(), getServerUser(), readComparisonIds()]);

  return (
    <html lang="ru">
      <body
        className={`${ebGaramond.variable} ${notoSerif.variable} ${notoSans.variable} antialiased`}
      >
        <Providers
          preloadedCart={preloadedCart}
          preloadedUser={preloadedUser}
          preloadedComparisonIds={preloadedComparisonIds}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
