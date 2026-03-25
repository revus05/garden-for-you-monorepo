"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signIn } from "@/entities/user";
import { paths } from "@/shared/constants/navigation";
import { useAppDispatch } from "@/shared/lib";
import { signInRequest } from "./api";
import { type SignInValues, signInSchema } from "./schema";

export type { SignInValues } from "./schema";
export { signInSchema } from "./schema";

export const useSignInForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    try {
      const customer = await signInRequest(values);
      dispatch(signIn(customer));

      router.push(paths.home);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Неверный email или пароль.",
      );
    }
  }

  return { ...form, onSubmit };
};
