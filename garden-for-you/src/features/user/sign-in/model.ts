import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "entities/user";
import { signInRequest } from "features/user/sign-in/api";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { paths } from "shared/constants/navigation";
import { useAppDispatch } from "shared/lib/hooks";
import { toast } from "sonner";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов"),
});

export type SignInValues = z.infer<typeof signInSchema>;

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
