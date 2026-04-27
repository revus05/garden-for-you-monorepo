import { Catalog } from "@/widgets/home/catalog";
import { HeroSection } from "@/widgets/home/hero";
import { withHomeLayout } from "@/widgets/layouts/home";

const HomePage = () => {
  return (
    <div className="wrapper flex flex-col gap-12">
      <div className="bg-background-secondary w-[70vw] h-80 absolute top-0 left-0 rounded-br-[64px] -z-1" />
      <div className="lg:w-6xl w-full mx-auto">
        <HeroSection />
      </div>
      <Catalog />
    </div>
  );
};

export default withHomeLayout(HomePage);
