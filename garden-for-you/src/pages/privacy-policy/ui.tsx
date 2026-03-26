import { withHomeLayout } from "@/widgets/layouts/home";
import { PrivacyPolicyText } from "@/widgets/privacy-policy/static";

const PrivacyPolicyPage = () => {
  return <PrivacyPolicyText />;
};

export default withHomeLayout(PrivacyPolicyPage);
