import { getProductByHandle } from "entities/product/server/get-product-by-handle";
import { notFound } from "next/navigation";
import ProductPageView from "pages/product";

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

const ProductPage = async ({ params }: ProductPageProps) => {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return <ProductPageView product={product} />;
};

export default ProductPage;
