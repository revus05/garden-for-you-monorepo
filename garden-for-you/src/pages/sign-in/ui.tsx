import { SignInForm } from "features/sign-in";
import { withAuthLayout } from "widgets/layouts/auth";

const SignInPage = () => {
  return <SignInForm />;
};

export default withAuthLayout(SignInPage);
