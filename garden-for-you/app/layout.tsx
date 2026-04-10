import type { Metadata } from "next";
import { EB_Garamond, Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "@/app/providers";
import { getServerCart } from "@/entities/cart/server/get-server-cart";
import { getServerComparison } from "@/entities/comparison/server/get-server-comparison";
import { getServerUser } from "@/entities/user/server/get-server-user";

const notoSans = Noto_Sans({ subsets: ["cyrillic"], variable: "--font-sans" });
const notoSerif = Noto_Serif({
  subsets: ["cyrillic"],
  variable: "--font-logo",
});
const ebGaramond = EB_Garamond({
  subsets: ["cyrillic"],
  variable: "--font-serif",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saddlyavas.by";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Сад Для Вас — интернет-магазин растений и товаров для сада",
    template: "%s | Сад Для Вас",
  },
  description:
    "Интернет-магазин растений, семян и товаров для сада в Беларуси. Широкий ассортимент комнатных и садовых растений с доставкой по всей стране.",
  keywords: [
    "растения",
    "сад",
    "комнатные растения",
    "садовые растения",
    "семена",
    "цветы",
    "Беларусь",
    "интернет-магазин",
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
    title: "Сад Для Вас — интернет-магазин растений и товаров для сада",
    description:
      "Интернет-магазин растений, семян и товаров для сада в Беларуси. Широкий ассортимент комнатных и садовых растений с доставкой по всей стране.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Сад Для Вас — интернет-магазин растений и товаров для сада",
    description:
      "Интернет-магазин растений, семян и товаров для сада в Беларуси.",
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
  const [preloadedCart, preloadedUser, preloadedComparison] = await Promise.all(
    [getServerCart(), getServerUser(), getServerComparison()],
  );

  return (
    <html lang="ru">
      <body
        className={`${ebGaramond.variable} ${notoSerif.variable} ${notoSans.variable} antialiased`}
      >
        <Providers
          preloadedCart={preloadedCart}
          preloadedUser={preloadedUser}
          preloadedComparison={preloadedComparison}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
