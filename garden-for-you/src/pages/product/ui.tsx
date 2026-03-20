import type { Product } from "entities/product/model/types";

import { withHomeLayout } from "widgets/layouts/home";
import { ProductImage } from "widgets/product/image";
import { ProductInfo } from "widgets/product/info";

type ProductPageViewProps = {
  product: Product;
};

const ProductPageView = ({ product }: ProductPageViewProps) => {
  return (
    <div className="wrapper">
      <div className="flex gap-8">
        <ProductImage product={product} />
        <ProductInfo product={product} />
      </div>
    </div>
  );
};

export default withHomeLayout(ProductPageView);
