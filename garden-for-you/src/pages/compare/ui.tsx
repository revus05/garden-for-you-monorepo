import { CompareWidget } from "@/widgets/compare/ui";
import { withHomeLayout } from "@/widgets/layouts/home";

const ComparePageView = () => {
  return <CompareWidget />;
};

export default withHomeLayout(ComparePageView);
