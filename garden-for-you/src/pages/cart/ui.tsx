import { CartList } from "@/widgets/cart/list";
import { CartTotal } from "@/widgets/cart/total";
import { withHomeLayout } from "@/widgets/layouts/home";

const CartPage = () => {
  return (
    <div className="wrapper flex flex-col gap-8 md:flex-row lg:items-start">
      <CartList />
      <CartTotal />
    </div>
  );
};

export default withHomeLayout(CartPage);
