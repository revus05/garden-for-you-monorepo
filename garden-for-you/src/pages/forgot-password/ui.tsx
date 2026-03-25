import { ForgotPasswordForm } from "@/features/user/forgot-password/ui";
import { withHomeLayout } from "@/widgets/layouts/home";

const ForgotPasswordPage = () => {
  return <ForgotPasswordForm />;
};

export default withHomeLayout(ForgotPasswordPage);
