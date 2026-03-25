import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов"),
});

export type SignInValues = z.infer<typeof signInSchema>;
