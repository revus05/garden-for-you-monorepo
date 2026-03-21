import Image from "next/image";
import { Badge } from "shared/ui/badge";
import { Button } from "shared/ui/button";
import { Icons } from "shared/ui/icons";
import { Catalog } from "widgets/home/catalog";
import { HeroSection } from "widgets/home/hero";
import { withHomeLayout } from "widgets/layouts/home";
import leafPlant from "../../../public/image/leaf-plant.png";
import leavesBg from "../../../public/image/leaves-bg.jpg";

const HomePage = () => {
  return (
    <div className="wrapper flex flex-col gap-12">
      <div className="bg-background-secondary w-[70vw] h-128 absolute top-0 left-0 rounded-br-[64px] -z-1" />
      <HeroSection />
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
            <span className="font-medium">
              Бесплатная доставка при 20 заказе
            </span>
          </div>
          <Button className="w-fit">
            Подробнее <Icons.arrowRight className="stroke-primary-foreground" />
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
            Подробнее{" "}
            <Icons.arrowRight className="stroke-secondary-foreground" />
          </Button>
        </div>
      </section>
      <Catalog />
    </div>
  );
};

export default withHomeLayout(HomePage);
