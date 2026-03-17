import { SignUpForm } from "features/sign-up";
import { withAuthLayout } from "widgets/layouts/auth";

const SignUpPage = () => {
  return <SignUpForm />;
};

export default withAuthLayout(SignUpPage);
