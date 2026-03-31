import { z } from "zod";

export type ShippingOption = {
  id: string;
  name: string;
  amount: number;
  type_code: string;
};

export const shippingSchema = z
  .object({
    shippingOptionId: z.string().min(1, "Выберите способ получения"),
    requiresAddress: z.boolean(),
    firstName: z.string().trim().min(2, "Введите имя"),
    lastName: z.string().trim().min(2, "Введите фамилию"),
    email: z.string().trim().email("Некорректный email"),
    phone: z.string().trim().min(7, "Введите телефон"),
    address1: z.string().trim().optional(),
    city: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.requiresAddress) {
      if (!data.address1 || data.address1.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите адрес",
          path: ["address1"],
        });
      }
      if (!data.city || data.city.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите город",
          path: ["city"],
        });
      }
      if (!data.postalCode || data.postalCode.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите почтовый индекс",
          path: ["postalCode"],
        });
      }
    }
  });

export type ShippingValues = z.infer<typeof shippingSchema>;
