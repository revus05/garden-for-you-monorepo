import type { StoreProduct } from "@medusajs/types";
import Image from "next/image";
import type { FC } from "react";
import plantPlaceholder from "../../../../public/image/plant-placholder.svg";

type ProductImageProps = {
  product: StoreProduct;
};

export const ProductImage: FC<ProductImageProps> = ({ product }) => {
  return (
    <div className="aspect-square rounded-xl border flex justify-center items-center">
      {product.thumbnail ? (
        <Image
          src={product.thumbnail}
          width={620}
          height={620}
          alt={`${product.title} thumbnail`}
          className="aspect-square rounded-[13px]"
        />
      ) : (
        <Image
          src={plantPlaceholder.src}
          width={620}
          height={620}
          alt={`${product.title} thumbnail`}
          className="w-[70%] object-cover translate-x-2 rounded-[13px]"
        />
      )}
    </div>
  );
};
