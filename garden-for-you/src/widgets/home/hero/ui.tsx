"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { Button } from "shared/ui/button";
import heroImage from "../../../../public/image/hero.png";

export const HeroSection = () => {
  const scrollToCatalog = useCallback(() => {
    const element = document.querySelector("#catalog");
    if (!element) return;

    const headerOffset = 120;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }, []);

  return (
    <section className="flex">
      <div className="w-1/2 flex flex-col justify-center gap-4 md:min-h-128">
        <h1 className="font-black text-3xl text-[#354733]">
          Сад для вас — Магазин отборных саженцев
        </h1>
        <span>
          Выбирайте подходящие растения и создавайте зелёный уголок, который
          будет радовать вас долгие годы. 🌱
        </span>
        <Button className="w-fit" onClick={scrollToCatalog} size="lg">
          Перейти в каталог <ArrowRight className="stroke-primary-foreground" />
        </Button>
      </div>
      <div className="relative w-1/2 -z-1 md:block flex items-center">
        <Image
          src={heroImage.src}
          width={600}
          height={1000}
          className="md:absolute top-1/2 right-0 md:-translate-y-2/5 select-none -z-1 md:w-auto w-full md:max-w-112.5"
          alt="hero image"
        />
      </div>
    </section>
  );
};
