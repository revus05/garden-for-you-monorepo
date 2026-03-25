"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { paths } from "@/shared/constants/navigation";
import { cn } from "@/shared/lib";
import {
  Button,
  ButtonGroup,
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui";
import { useSignInForm } from "./model";

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    onSubmit,
  } = useSignInForm();

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 flex flex-col gap-6">
      <h2 className="text-2xl font-black">Вход</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <InputGroup className="gap-2 sm:px-1.5 px-1 shadow-md">
                    <InputGroupAddon align="inline-start">
                      <Mail className="stroke-primary" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="email"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      placeholder="example@gmail.com"
                      className="text-primary"
                      {...register("email")}
                    />
                  </InputGroup>
                  <FieldError errors={[errors.email]} />
                </FieldContent>
              </FieldLabel>
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <ButtonGroup
                    className={cn(
                      "w-full shadow-md rounded-lg",
                      errors.password &&
                        "border-destructive dark:border-destructive/50",
                    )}
                  >
                    <InputGroup className="gap-2 sm:px-1.5 px-1">
                      <InputGroupAddon align="inline-start">
                        <Lock className="stroke-primary" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        aria-invalid={!!errors.password}
                        placeholder="Введите пароль"
                        className="text-primary"
                        {...register("password")}
                      />
                    </InputGroup>
                    <Button
                      onClick={() => setShowPassword((prev) => !prev)}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      {showPassword ? (
                        <EyeOff className="stroke-primary" />
                      ) : (
                        <Eye className="stroke-primary" />
                      )}
                    </Button>
                  </ButtonGroup>
                  <FieldError errors={[errors.password]} />
                </FieldContent>
              </FieldLabel>
            </Field>

            <Link
              className="underline underline-offset-4 text-sm text-muted-foreground"
              href={paths.forgotPassword}
            >
              Забыли пароль?
            </Link>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mx-auto sm:w-fit sm:px-24 w-full"
                size="lg"
              >
                {isSubmitting ? "Входим..." : "Войти"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Нет аккаунта?{" "}
                <Link
                  className="underline underline-offset-4"
                  href={paths.signUp}
                >
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
