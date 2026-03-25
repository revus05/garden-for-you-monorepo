import { Catalog } from "@/widgets/home/catalog";
import { HeroSection } from "@/widgets/home/hero";
import { SalesCardsSection } from "@/widgets/home/sales-cards";
import { withHomeLayout } from "@/widgets/layouts/home";

const HomePage = () => {
  return (
    <div className="wrapper flex flex-col gap-12">
      <div className="bg-background-secondary w-[70vw] h-128 absolute top-0 left-0 rounded-br-[64px] -z-1" />
      <HeroSection />
      <SalesCardsSection />
      <Catalog />
    </div>
  );
};

export default withHomeLayout(HomePage);
