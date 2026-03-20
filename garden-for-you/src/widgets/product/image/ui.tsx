"use client";

import type { StoreProduct } from "@medusajs/types";
import Image from "next/image";
import { type FC, useState } from "react";
import { cn } from "shared/lib/utils";
import plantPlaceholder from "../../../../public/image/plant-placholder.svg";

type ProductImageProps = {
  product: StoreProduct;
};

export const ProductImage: FC<ProductImageProps> = ({ product }) => {
  const [currentThumbnail, setCurrentThumbnail] = useState(
    product.thumbnail || "",
  );

  return (
    <div className="flex flex-col gap-4">
      {product.thumbnail ? (
        <Image
          src={currentThumbnail}
          width={620}
          height={620}
          alt={`${product.title} thumbnail`}
          className="aspect-square rounded-xl border"
        />
      ) : (
        <div className="aspect-square rounded-xl border flex justify-center items-center">
          <Image
            src={plantPlaceholder.src}
            width={620}
            height={620}
            alt={`${product.title} thumbnail`}
            className="w-[70%] object-cover translate-x-2"
          />
        </div>
      )}

      {product.images && product.images?.length > 1 && (
        <div className="flex gap-2 justify-center">
          {product.images?.map((image, index) => (
            <Image
              key={image.url}
              src={image.url}
              width={100}
              height={100}
              alt={`${product.title} image ${index}`}
              className={cn(
                "aspect-square rounded-lg border",
                currentThumbnail === image.url && " border-primary",
              )}
              onClick={() => setCurrentThumbnail(image.url)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
