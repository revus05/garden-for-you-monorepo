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
