"use client";

// import { Check, CreditCard, MapPin } from "lucide-react";
// import { type ReactNode, useState } from "react";
// import { ConfirmOrderForm } from "@/features/checkout/confirm-order";
// import {
//   ShippingForm,
//   type ShippingOption,
// } from "@/features/checkout/shipping-form";
// import { cn } from "@/shared/lib";
// import { Button } from "@/shared/ui";

// type Step = "shipping" | "payment";

// const steps: { id: Step; label: string; icon: ReactNode }[] = [
//   { id: "shipping", label: "Доставка", icon: <MapPin className="h-4 w-4" /> },
//   {
//     id: "payment",
//     label: "Подтверждение",
//     icon: <CreditCard className="h-4 w-4" />,
//   },
// ];

export const CheckoutPage = () => {
  // const [currentStep, setCurrentStep] = useState<Step>("shipping");
  // const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);
  // const [orderPlaced, setOrderPlaced] = useState(false);
  // const currentIndex = steps.findIndex((s) => s.id === currentStep);

  // function handleShippingSuccess(option: ShippingOption) {
  //   setSelectedOption(option);
  //   setCurrentStep("payment");
  // }

  return (
    <div className="wrapper max-w-lg py-8 flex flex-col gap-8">
      <h1 className="text-3xl font-black">Оформление заказа</h1>

      <div className="rounded-xl border border-border bg-background-secondary/40 p-6 text-center flex flex-col gap-2">
        <p className="font-semibold text-lg">Оформление заказов временно недоступно</p>
        <p className="text-sm text-muted-foreground">
          Для заказа, пожалуйста, свяжитесь с нами по телефону.
        </p>
      </div>
    </div>
  );
};
