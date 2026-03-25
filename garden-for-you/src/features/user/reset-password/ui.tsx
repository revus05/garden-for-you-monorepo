"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
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
import { useResetPasswordForm } from "./model";

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    onSubmit,
    token,
  } = useResetPasswordForm();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10">
      <h2 className="text-center text-2xl font-black">Сброс пароля</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldGroup>
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

            <Field data-invalid={!!errors.repeatPassword}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <ButtonGroup
                    className={cn(
                      "w-full shadow-md rounded-lg",
                      errors.repeatPassword &&
                        "border-destructive dark:border-destructive/50",
                    )}
                  >
                    <InputGroup className="gap-2 sm:px-1.5 px-1">
                      <InputGroupAddon align="inline-start">
                        <Lock className="stroke-primary" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type={showRepeatPassword ? "text" : "password"}
                        autoComplete="current-password"
                        aria-invalid={!!errors.repeatPassword}
                        placeholder="Введите пароль"
                        className="text-primary"
                        {...register("repeatPassword")}
                      />
                    </InputGroup>
                    <Button
                      onClick={() => setShowRepeatPassword((prev) => !prev)}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      {showRepeatPassword ? (
                        <EyeOff className="stroke-primary" />
                      ) : (
                        <Eye className="stroke-primary" />
                      )}
                    </Button>
                  </ButtonGroup>
                  <FieldError errors={[errors.repeatPassword]} />
                </FieldContent>
              </FieldLabel>
            </Field>

            {!token && (
              <p className="text-center text-sm text-destructive">
                Ссылка для сброса недействительна или неполная.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || !token}
                className="mx-auto sm:w-fit sm:px-24 w-full"
                size="lg"
              >
                {isSubmitting ? "Сохраняем..." : "Сменить пароль"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Вспомнили пароль?{" "}
                <Link
                  className="underline underline-offset-4"
                  href={paths.signIn}
                >
                  Войти
                </Link>
              </p>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
