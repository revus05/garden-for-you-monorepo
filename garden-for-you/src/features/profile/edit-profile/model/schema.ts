import { z } from "zod";
import { phoneSchema } from "@/shared/model/phone-schema";

export const editProfileSchema = z.object({
  first_name: z.string().min(1, "Введите имя"),
  last_name: z.string().min(1, "Введите фамилию"),
  phone: phoneSchema,
});

export type EditProfileValues = z.infer<typeof editProfileSchema>;
