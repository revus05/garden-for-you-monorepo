import { z } from "zod";
import { phoneSchema } from "@/shared/model/phone-schema";

export const signUpSchema = z
  .object({
    first_name: z.string().trim().min(2, "Введите имя"),
    last_name: z.string().trim().min(2, "Введите фамилию"),
    email: z.string().trim().email("Некорректный email"),
    phone: phoneSchema,
    password: z.string().min(8, "Пароль должен быть не короче 8 символов"),
    repeatPassword: z
      .string()
      .min(8, "Пароль должен быть не короче 8 символов"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Пароли не совпадают",
    path: ["repeatPassword"],
  });

export type SignUpValues = z.infer<typeof signUpSchema>;
