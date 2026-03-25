"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signIn } from "@/entities/user";
import { paths } from "@/shared/constants/navigation";
import { useAppDispatch } from "@/shared/lib";
import { signUpRequest } from "./api";
import { type SignUpValues, signUpSchema } from "./schema";

export type { SignUpValues } from "./schema";
export { signUpSchema } from "./schema";

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
