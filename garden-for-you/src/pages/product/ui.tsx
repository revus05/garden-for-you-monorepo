import type { Product, ProductSpec } from "@/entities/product";

import { withHomeLayout } from "@/widgets/layouts/home";
import { ProductImage } from "@/widgets/product/image";
import { ProductInfo } from "@/widgets/product/info";

type ProductPageViewProps = {
  product: Product;
  specs: ProductSpec[];
};

const ProductPageView = ({ product, specs }: ProductPageViewProps) => {
  return (
    <div className="wrapper">
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-8">
        <ProductImage product={product} />
        <ProductInfo product={product} specs={specs} />
      </div>
    </div>
  );
};

export default withHomeLayout(ProductPageView);
