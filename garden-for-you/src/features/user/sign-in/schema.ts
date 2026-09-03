import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Введите email или телефон"),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов"),
});

export type SignInValues = z.infer<typeof signInSchema>;
