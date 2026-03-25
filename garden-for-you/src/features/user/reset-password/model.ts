"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { paths } from "@/shared/constants/navigation";
import { resetPasswordRequest } from "./api";
import { type ResetPasswordValues, resetPasswordSchema } from "./schema";

export type { ResetPasswordValues } from "./schema";
export { resetPasswordSchema } from "./schema";

export const useResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token")?.trim() ?? "";

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      repeatPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    try {
      const response = await resetPasswordRequest({
        ...values,
        token,
      });

      toast.success(response.message);
      router.push(paths.signIn);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Что-то пошло не так",
      );
    }
  }

  return { ...form, onSubmit, token };
};
