import { z } from "zod";

export const signUpSchema = z
  .object({
    first_name: z.string().trim().min(2, "Введите имя"),
    last_name: z.string().trim().min(2, "Введите фамилию"),
    email: z.string().trim().email("Некорректный email"),
    phone: z
      .string()
      .trim()
      .refine(
        (val) => {
          const digits = val.replace(/\D/g, "");

          if (digits.length === 12 && digits.startsWith("375")) {
            const code = digits.slice(3, 5);
            return ["29", "33", "44", "25"].includes(code);
          }

          if (digits.length === 11 && digits.startsWith("80")) {
            const code = digits.slice(2, 4);
            return ["29", "33", "44", "25"].includes(code);
          }

          if (digits.length === 9) {
            const code = digits.slice(0, 2);
            return ["29", "33", "44", "25"].includes(code);
          }

          return false;
        },
        { message: "Некорректный номер" },
      )
      .transform((val) => {
        if (!val) return undefined;
        const digits = val.replace(/\D/g, "");
        if (digits.startsWith("80")) {
          return `+375${digits.slice(2)}`;
        }
        if (digits.startsWith("375")) {
          return `+${digits}`;
        }
        return `+375${digits}`;
      }),
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
