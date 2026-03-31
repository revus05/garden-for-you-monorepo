"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch } from "@/shared/lib";
import { resetCart } from "@/entities/cart";
import { paths } from "@/shared/constants/navigation";
import { completeOrderRequest } from "./api";

export const useConfirmOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  async function placeOrder() {
    setIsLoading(true);
    try {
      const { order } = await completeOrderRequest();
      dispatch(resetCart());
      toast.success(`Заказ #${order.display_id} успешно оформлен!`);
      router.push(paths.home);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Что-то пошло не так",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return { placeOrder, isLoading };
};
