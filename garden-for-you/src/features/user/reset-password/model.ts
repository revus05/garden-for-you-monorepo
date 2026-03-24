import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordRequest } from "features/user/reset-password/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { paths } from "shared/constants/navigation";
import { toast } from "sonner";
import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Ссылка для сброса недействительна"),
    password: z.string().min(8, "Пароль должен быть не короче 8 символов"),
    repeatPassword: z
      .string()
      .min(8, "Пароль должен быть не короче 8 символов"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Пароли не совпадают",
    path: ["repeatPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

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
