"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import leafPlant from "@/images/leaf-plant.png";
import leavesBg from "@/images/leaves-bg.jpg";
import { Badge, Button } from "@/shared/ui";

export const SalesCardsSection = () => {
  return (
    <section className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
      <div className="px-6 py-8 bg-background-secondary rounded-lg flex flex-col gap-4 overflow-hidden relative">
        <Image
          src={leafPlant.src}
          width={150}
          height={100}
          alt="hero image"
          className="-scale-x-100 absolute -right-2 bottom-0 select-none"
        />
        <div className="flex flex-col gap-1 z-1">
          <Badge>Акция</Badge>
          <h2 className="text-4xl font-black">37% скидка</h2>
          <span className="font-medium">Бесплатная доставка при 20 заказе</span>
        </div>
        <Button className="w-fit">
          Подробнее <ArrowRight className="stroke-primary-foreground" />
        </Button>
      </div>
      <div
        className="px-6 py-8 bg-background-secondary rounded-lg flex flex-col gap-4 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(oklch(0.502 0.0742 123.84 / 80%),oklch(0.502 0.0742 123.84 / 80%)),url(${leavesBg.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "var(-primary)",
        }}
      >
        <div className="flex flex-col gap-1">
          <Badge variant="secondary">Акция</Badge>
          <h2 className="text-4xl font-black text-primary-foreground">
            37% скидка
          </h2>
          <span className="font-medium text-primary-foreground">
            Бесплатная доставка при 20 заказе
          </span>
        </div>
        <Button className="w-fit" variant="secondary">
          Подробнее <ArrowRight className="stroke-secondary-foreground" />
        </Button>
      </div>
    </section>
  );
};
