import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getSiteConfig } from "@/entities/site-config/server";
import leavesBg from "@/images/leaves-bg.jpg";
import { paths } from "@/shared/constants/navigation";
import { Badge, Button } from "@/shared/ui";

export const SalesCardsSection = async () => {
  const config = await getSiteConfig();
  const percent = config["sale.percent"];
  const description = config["sale.description"];
  const productHandle = config["sale.product_handle"];

  if (!percent && !description) return null;

  const href = productHandle
    ? `${paths.productPage}/${productHandle}`
    : paths.home;

  return (
    <section>
      <div
        className="px-6 py-8 bg-background-secondary rounded-lg flex flex-col gap-4 overflow-hidden items-center max-w-lg mx-auto"
        style={{
          backgroundImage: `linear-gradient(oklch(0.502 0.0742 123.84 / 80%),oklch(0.502 0.0742 123.84 / 80%)),url(${leavesBg.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "var(-primary)",
        }}
      >
        <div className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-1">
            <Badge variant="secondary">Акция</Badge>
            {percent && (
              <h2 className="text-4xl font-black text-primary-foreground">
                {percent} скидка
              </h2>
            )}
            {description && (
              <span className="font-medium text-primary-foreground">
                {description}
              </span>
            )}
          </div>
          <Button className="w-fit" variant="secondary" asChild>
            <Link href={href}>
              Подробнее <ArrowRight className="stroke-secondary-foreground" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
