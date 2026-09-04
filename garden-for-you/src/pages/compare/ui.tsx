import { getServerComparison } from "@/entities/comparison/server";
import { CompareWidget } from "@/widgets/compare/ui";
import { withHomeLayout } from "@/widgets/layouts/home";

const ComparePageView = async () => {
  const products = await getServerComparison();

  return <CompareWidget initialProducts={products} />;
};

export default withHomeLayout(ComparePageView);
