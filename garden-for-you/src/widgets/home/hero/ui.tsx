import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getSiteConfig } from "@/entities/site-config/server/get-site-config";
import heroImage from "@/images/banner-grid.jpg";
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

  const leafPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cg transform='translate(30,35) rotate(-25)'%3E%3Cpath d='M0,-22 C11,-22 20,-11 20,0 C20,15 11,23 0,26 C-11,23 -20,15 -20,0 C-20,-11 -11,-22 0,-22Z' fill='white'/%3E%3Cline x1='0' y1='-22' x2='0' y2='26' stroke='%23354733' stroke-width='1.5'/%3E%3Cline x1='-8' y1='4' x2='0' y2='-4' stroke='%23354733' stroke-width='1'/%3E%3Cline x1='8' y1='4' x2='0' y2='-4' stroke='%23354733' stroke-width='1'/%3E%3C/g%3E%3Cg transform='translate(105,95) rotate(35)'%3E%3Cpath d='M0,-17 C9,-17 15,-8 15,0 C15,11 9,18 0,20 C-9,18 -15,11 -15,0 C-15,-8 -9,-17 0,-17Z' fill='white'/%3E%3Cline x1='0' y1='-17' x2='0' y2='20' stroke='%23354733' stroke-width='1.2'/%3E%3Cline x1='-6' y1='3' x2='0' y2='-3' stroke='%23354733' stroke-width='0.8'/%3E%3Cline x1='6' y1='3' x2='0' y2='-3' stroke='%23354733' stroke-width='0.8'/%3E%3C/g%3E%3Cg transform='translate(90,28) rotate(65)'%3E%3Cpath d='M0,-12 C6,-12 11,-5 11,0 C11,8 6,13 0,14 C-6,13 -11,8 -11,0 C-11,-5 -6,-12 0,-12Z' fill='white'/%3E%3Cline x1='0' y1='-12' x2='0' y2='14' stroke='%23354733' stroke-width='1'/%3E%3C/g%3E%3Cg transform='translate(18,105) rotate(-55)'%3E%3Cpath d='M0,-14 C7,-14 13,-6 13,0 C13,9 7,15 0,17 C-7,15 -13,9 -13,0 C-13,-6 -7,-14 0,-14Z' fill='white'/%3E%3Cline x1='0' y1='-14' x2='0' y2='17' stroke='%23354733' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <section className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden bg-linear-to-br from-[#253d22] via-[#354733] to-[#4a6b3e] flex items-stretch min-h-64">
      <div
        className="absolute inset-0 opacity-[0.09] pointer-events-none"
        style={{
          backgroundImage: leafPattern,
          backgroundSize: "140px 140px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="flex-1 flex flex-col justify-center gap-4 px-8 py-8 md:px-12 relative z-10">
        <Badge className="w-fit bg-white/20 text-white border-0">
          🔥 Акция
        </Badge>
        <h1 className="font-black text-3xl text-white flex items-start flex-wrap gap-2">
          <span className="text-5xl leading-none">{percent}</span>
          <span className="self-end pb-1">скидка</span>
        </h1>
        <span className="text-white/80 text-sm max-w-xs">{description}</span>
        <Button
          asChild
          className="w-fit bg-white text-[#354733] hover:bg-white/90"
          size="lg"
        >
          <Link href={href}>
            К товару
            <ArrowRight className="stroke-[#354733]" />
          </Link>
        </Button>
      </div>
      <div
        className="relative hidden md:flex items-center justify-end z-10"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 35%)",
        }}
      >
        <Image
          src={heroImage.src}
          width={300}
          height={400}
          className="object-contain select-none max-h-64 w-auto"
          alt="hero image"
        />
      </div>
    </section>
  );
};
