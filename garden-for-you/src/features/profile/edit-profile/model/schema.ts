import { phoneSchema } from "shared/model/phone-schema";
import { z } from "zod";

export const editProfileSchema = z.object({
  first_name: z.string().min(1, "Введите имя"),
  last_name: z.string().min(1, "Введите фамилию"),
  phone: phoneSchema,
});

export type EditProfileValues = z.infer<typeof editProfileSchema>;
