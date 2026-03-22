import { SignUpForm } from "features/user/sign-up";
import { withHomeLayout } from "widgets/layouts/home";

const SignUpPage = () => {
  return <SignUpForm />;
};

export default withHomeLayout(SignUpPage);
