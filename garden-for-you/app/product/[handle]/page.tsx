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
