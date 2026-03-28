import { notFound } from "next/navigation";
import { getProductByHandle } from "@/entities/product/server/get-product-by-handle";
import ProductPageView from "@/pages/product";

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

const ProductPage = async ({ params }: ProductPageProps) => {
  const { handle } = await params;
  const result = await getProductByHandle(handle);

  if (!result) {
    notFound();
  }

  return <ProductPageView product={result.product} specs={result.specs} />;
};

export default ProductPage;
