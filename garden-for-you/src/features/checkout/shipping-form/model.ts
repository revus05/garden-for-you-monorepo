"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAppSelector } from "@/shared/lib";
import { fetchShippingOptions, submitShippingRequest } from "./api";
import {
  type ShippingOption,
  type ShippingValues,
  shippingSchema,
} from "./schema";

export type { ShippingOption, ShippingValues } from "./schema";
export { shippingSchema } from "./schema";

export const useShippingForm = (
  onSuccess: (option: ShippingOption) => void,
) => {
  const user = useAppSelector((state) => state.userSlice.user);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const form = useForm<ShippingValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      shippingOptionId: "",
      requiresAddress: false,
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address1: "",
      city: "Минск",
      postalCode: "",
    },
  });

  useEffect(() => {
    setOptionsLoading(true);
    setOptionsError(null);
    fetchShippingOptions()
      .then((options) => {
        setShippingOptions(options);
        if (options.length > 0) {
          const first = options[0];
          form.setValue("shippingOptionId", first.id);
          form.setValue("requiresAddress", first.type_code === "delivery");
        }
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : "Не удалось загрузить способы доставки";
        setOptionsError(message);
        toast.error(message);
      })
      .finally(() => setOptionsLoading(false));
  }, []);

  function selectOption(option: ShippingOption) {
    form.setValue("shippingOptionId", option.id);
    form.setValue("requiresAddress", option.type_code === "delivery");
  }

  async function onSubmit(values: ShippingValues) {
    try {
      await submitShippingRequest(values);
      const selected = shippingOptions.find(
        (o) => o.id === values.shippingOptionId,
      );
      if (selected) {
        onSuccess(selected);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Что-то пошло не так",
      );
    }
  }

  return {
    ...form,
    onSubmit,
    shippingOptions,
    optionsLoading,
    optionsError,
    selectOption,
  };
};
