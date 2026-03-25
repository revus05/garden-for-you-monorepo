import { withHomeLayout } from "@/widgets/layouts/home";
import { PaymentAndShippingStaticContent } from "@/widgets/payment-and-shipping/static";

const PaymentAndShippingPage = () => {
  return (
    <div className="wrapper py-12">
      <PaymentAndShippingStaticContent />
    </div>
  );
};

export default withHomeLayout(PaymentAndShippingPage);
