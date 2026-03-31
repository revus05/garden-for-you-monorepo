import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CheckoutPage } from "@/pages/checkout";
import { AUTH_TOKEN_COOKIE } from "@/shared/config/auth";
import { paths } from "@/shared/constants/navigation";
import { withHomeLayout } from "@/widgets/layouts/home";

async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${paths.signIn}?path=/checkout`);
  }

  return <CheckoutPage />;
}

export default withHomeLayout(Page);
