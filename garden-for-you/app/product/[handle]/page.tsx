import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProductHandles,
  getProductByHandle,
} from "@/entities/product/server";
import ProductPageView from "@/pages/product";

export const dynamicParams = true;

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const result = await getProductByHandle(handle);

  if (!result) return { title: "Товар не найден" };

  const { product } = result;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saddlyavas.by";
  const productUrl = `${siteUrl}/product/${handle}`;
  const imageUrl = product.thumbnail ?? product.images?.[0]?.url;
  const description =
    product.description ||
    `Купить ${product.title} с доставкой по Беларуси в интернет-магазине Сад Для Вас`;

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
        ? [{ url: imageUrl, alt: product.title ?? undefined }]
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

export async function generateStaticParams() {
  const handles = await getAllProductHandles();
  return handles.map((handle) => ({ handle }));
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
