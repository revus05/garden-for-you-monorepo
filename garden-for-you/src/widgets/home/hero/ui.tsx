import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getSiteConfig } from "@/entities/site-config/server/get-site-config";
import heroImage from "@/images/hero.png";
import { paths } from "@/shared/constants/navigation";
import { Badge, Button } from "@/shared/ui";

export const HeroSection = async () => {
  const config = await getSiteConfig();
  const percent = config["sale.percent"];
  const description = config["sale.description"];
  const productHandle = config["sale.product_handle"];

  if (!percent && !description) return null;

  const href = productHandle
    ? `${paths.productPage}/${productHandle}`
    : paths.home;

  return (
    <section className="flex md:w-3xl mx-auto">
      <div className="w-1/2 flex flex-col justify-center gap-4 md:min-h-72">
        <Badge>🔥Акция</Badge>
        <h1 className="font-black text-3xl text-[#354733] flex items-start">
          <span className="text-5xl">{percent}</span> скидка
        </h1>
        <span>{description}</span>
        <Button asChild className="w-fit" size="lg">
          <Link href={href}>
            К товару
            <ArrowRight className="stroke-primary-foreground" />
          </Link>
        </Button>
      </div>
      <div className="relative w-1/2 -z-1 md:block flex items-center">
        <Image
          src={heroImage.src}
          width={300}
          height={500}
          className="md:absolute top-1/2 right-0 md:-translate-y-1/2 select-none -z-1 md:w-auto w-full md:max-w-72"
          alt="hero image"
        />
      </div>
    </section>
  );
};
