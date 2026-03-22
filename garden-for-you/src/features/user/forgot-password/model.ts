import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Некорректный email"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
