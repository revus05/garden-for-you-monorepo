"use client";

import { Check, CreditCard, MapPin } from "lucide-react";
import { type ReactNode, useState } from "react";
import { ConfirmOrderForm } from "@/features/checkout/confirm-order";
import {
  ShippingForm,
  type ShippingOption,
} from "@/features/checkout/shipping-form";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";

type Step = "shipping" | "payment";

const steps: { id: Step; label: string; icon: ReactNode }[] = [
  { id: "shipping", label: "Доставка", icon: <MapPin className="h-4 w-4" /> },
  {
    id: "payment",
    label: "Подтверждение",
    icon: <CreditCard className="h-4 w-4" />,
  },
];

export const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState<Step>("shipping");
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(
    null,
  );

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  function handleShippingSuccess(option: ShippingOption) {
    setSelectedOption(option);
    setCurrentStep("payment");
  }

  return (
    <div className="wrapper max-w-lg py-8 flex flex-col  gap-8">
      <h1 className="text-3xl font-black">Оформление заказа</h1>

      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                index < currentIndex
                  ? "bg-primary text-primary-foreground"
                  : index === currentIndex
                    ? "bg-primary/15 text-primary ring-1 ring-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {index < currentIndex ? <Check className="h-4 w-4" /> : step.icon}
              {step.label}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 transition-colors",
                  index < currentIndex ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div>
        {currentStep === "shipping" && (
          <div>
            <h2 className="mb-1 text-xl font-semibold">Данные получения</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Выберите способ получения и укажите контактные данные
            </p>
            <ShippingForm onSuccess={handleShippingSuccess} />
          </div>
        )}

        {currentStep === "payment" && selectedOption && (
          <div className="flex flex-col gap-2">
            <h2 className="mb-1 text-xl font-semibold">Подтверждение заказа</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Проверьте состав заказа и подтвердите оформление
            </p>
            <ConfirmOrderForm shippingOption={selectedOption} />
            <Button
              variant="outline"
              onClick={() => setCurrentStep("shipping")}
            >
              Изменить данные получения
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
