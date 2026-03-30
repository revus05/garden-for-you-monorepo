"use client";

import { ArrowRight } from "lucide-react";
import leavesBg from "@/images/leaves-bg.jpg";
import { Badge, Button } from "@/shared/ui";

export const SalesCardsSection = () => {
  return (
    <section className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
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
