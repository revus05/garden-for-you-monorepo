import { CartList } from "widgets/cart/list";
import { CartTotal } from "widgets/cart/total";
import { withHomeLayout } from "widgets/layouts/home";

const CartPage = () => {
  return (
    <div className="wrapper flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <CartList />
      </div>
      <CartTotal />
    </div>
  );
};

export default withHomeLayout(CartPage);
