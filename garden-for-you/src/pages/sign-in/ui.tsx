import { SignInForm } from "features/sign-in";
import { withHomeLayout } from "widgets/layouts/home";

const SignInPage = () => {
  return <SignInForm />;
};

export default withHomeLayout(SignInPage);
