import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "entities/user";
import { signUpRequest } from "features/user/sign-up/api";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { paths } from "shared/constants/navigation";
import { useAppDispatch } from "shared/lib/hooks";
import { phoneSchema } from "shared/model/phone-schema";
import { toast } from "sonner";
import { z } from "zod";

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

export const useSignUpForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      repeatPassword: "",
    },
  });

  async function onSubmit(values: SignUpValues) {
    try {
      const customer = await signUpRequest(values);
      dispatch(signIn(customer));

      router.push(paths.home);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не удалось зарегистрироваться. Проверьте данные и попробуйте снова.",
      );
    }
  }

  return { ...form, onSubmit };
};
