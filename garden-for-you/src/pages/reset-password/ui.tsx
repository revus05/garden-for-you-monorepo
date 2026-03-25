import { ResetPasswordForm } from "@/features/user/reset-password";
import { withHomeLayout } from "@/widgets/layouts/home";

const ResetPasswordPage = () => {
  return <ResetPasswordForm />;
};

export default withHomeLayout(ResetPasswordPage);
