"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "entities/user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createElement, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "shared/lib/hooks";
import { paths } from "shared/navigation";
import { Button } from "shared/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "shared/ui/field";
import { Icons } from "shared/ui/icons";
import { Input } from "shared/ui/input";
import { toast } from "sonner";
import { signInRequest } from "../api/sign-in";
import { type SignInValues, signInSchema } from "../model/schema";

export function SignInForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);

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

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = form;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h2 className="text-2xl font-black">Вход</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Нет аккаунта?{" "}
        <Link className="underline underline-offset-4" href={paths.signUp}>
          Зарегистрироваться
        </Link>
      </p>

      <form className="mt-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel className="flex flex-col w-full items-start">
                <FieldTitle>Email</FieldTitle>
                <FieldContent className="w-full">
                  <Input
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    placeholder="example@gmail.com"
                    {...register("email")}
                  />
                  <FieldError errors={[{ message: errors.email?.message }]} />
                </FieldContent>
              </FieldLabel>
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel className="flex flex-col w-full items-start">
                <FieldTitle>Пароль</FieldTitle>
                <FieldContent className="w-full">
                  <div className="flex gap-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      placeholder={showPassword ? "StrongPassword" : "••••••••"}
                      {...register("password")}
                    />
                    <Button
                      onClick={() => setShowPassword((prev) => !prev)}
                      size="icon"
                      type="button"
                    >
                      {createElement(Icons[showPassword ? "eyeOff" : "eye"], {
                        className: "stroke-white",
                      })}
                    </Button>
                  </div>
                  <FieldError
                    errors={[{ message: errors.password?.message }]}
                  />
                </FieldContent>
              </FieldLabel>
            </Field>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Входим..." : "Войти"}
            </Button>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
