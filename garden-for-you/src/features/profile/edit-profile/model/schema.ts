import { z } from "zod";

export const editProfileSchema = z.object({
  first_name: z.string().min(1, "Введите имя"),
  last_name: z.string().min(1, "Введите фамилию"),
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
});

export type EditProfileValues = z.infer<typeof editProfileSchema>;
