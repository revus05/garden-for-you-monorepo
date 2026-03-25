import { AboutUsStaticContent } from "@/widgets/about-us/static";
import { withHomeLayout } from "@/widgets/layouts/home";

const AboutUsPage = () => {
  return <AboutUsStaticContent />;
};

export default withHomeLayout(AboutUsPage);
