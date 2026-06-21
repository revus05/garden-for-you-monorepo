import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/entities/product/server";
import ProductPageView from "@/pages/product";
import { publicEnv } from "@/shared/config/env";

// The root layout reads cookies() (cart/user/comparison), which forces dynamic
// rendering for every route. Page-level ISR is therefore impossible here, so
// render on-demand. Product data fetches stay cached via cache tags, so the
// backend is not hit on every request.
export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();
}

function toAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${siteUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const result = await getProductByHandle(handle);

  if (!result) return { title: "Товар не найден" };

  const { product } = result;
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;
  const productUrl = `${siteUrl}/product/${handle}`;

  const rawImageUrl = product.thumbnail ?? product.images?.[0]?.url;
  const imageUrl = toAbsoluteUrl(rawImageUrl, siteUrl);

  const rawDescription = product.description
    ? stripHtml(product.description)
    : `Купить ${product.title} с доставкой по Беларуси в питомнике Сад Для Вас`;
  const description =
    rawDescription.length > 160
      ? rawDescription.slice(0, 157) + "..."
      : rawDescription;

  return {
    title: product.title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      url: productUrl,
      title: product.title ?? undefined,
      description,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: product.title ?? undefined }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title ?? undefined,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { handle } = await params;
  const result = await getProductByHandle(handle);

  if (!result) {
    notFound();
  }

  return <ProductPageView product={result.product} specs={result.specs} />;
};

export default ProductPage;
