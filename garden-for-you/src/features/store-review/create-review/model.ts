import { z } from "zod";

export const createStoreReviewSchema = z.object({
  author_name: z
    .string()
    .trim()
    .min(2, "Укажите имя не короче 2 символов")
    .max(120, "Имя должно быть не длиннее 120 символов"),
  phone: z
    .string()
    .trim()
    .min(1, "Укажите номер телефона")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, "Введите корректный номер (10–15 цифр)"),
  rating: z.coerce
    .number()
    .int("Оценка должна быть целым числом")
    .min(1, "Минимальная оценка 1")
    .max(5, "Максимальная оценка 5"),
  message: z
    .string()
    .trim()
    .min(1, "Отзыв не может быть пустым")
    .max(2000, "Отзыв должен быть не длиннее 2000 символов"),
});

export type CreateStoreReviewValues = z.infer<typeof createStoreReviewSchema>;
