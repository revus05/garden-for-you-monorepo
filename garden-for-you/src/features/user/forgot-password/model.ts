"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { forgotPasswordRequest } from "./api";
import { type ForgotPasswordValues, forgotPasswordSchema } from "./schema";

export type { ForgotPasswordValues } from "./schema";
export { forgotPasswordSchema } from "./schema";

export const useForgotPasswordForm = () => {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      const response = await forgotPasswordRequest(values);

      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Что-то пошло не так",
      );
    }
  }

  return { ...form, onSubmit };
};
