"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signIn } from "@/entities/user";
import { paths } from "@/shared/constants/navigation";
import { useAppDispatch } from "@/shared/lib";
import { sendCodeRequest, signUpRequest, verifyCodeRequest } from "./api";
import { type SignUpValues, signUpSchema } from "./schema";

export type { SignUpValues } from "./schema";
export { signUpSchema } from "./schema";

type Step = "form" | "code";

export const useSignUpForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<Step>("form");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const pendingValues = useRef<SignUpValues | null>(null);

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
    if (!values.phone) return;
    try {
      await sendCodeRequest(values.phone);
      pendingValues.current = values;
      setStep("code");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не удалось отправить код.",
      );
    }
  }

  async function onVerify(code: string) {
    const values = pendingValues.current;
    if (!values?.phone) return;
    setIsVerifying(true);
    try {
      const token = await verifyCodeRequest(values.phone, code);
      const customer = await signUpRequest(values, token);
      dispatch(signIn(customer));
      router.push(paths.home);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не удалось зарегистрироваться.",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  async function onResend() {
    const values = pendingValues.current;
    if (!values?.phone) return;
    setIsResending(true);
    try {
      await sendCodeRequest(values.phone);
      toast.success("Код отправлен повторно.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не удалось отправить код.",
      );
    } finally {
      setIsResending(false);
    }
  }

  function onBack() {
    setStep("form");
  }

  return {
    ...form,
    onSubmit,
    step,
    onVerify,
    onResend,
    onBack,
    isVerifying,
    isResending,
  };
};
