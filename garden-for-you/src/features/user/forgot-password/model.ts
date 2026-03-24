import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { forgotPasswordRequest } from "./api";

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Некорректный email"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

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
