"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { paths } from "shared/constants/navigation";
import { Button } from "shared/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "shared/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "shared/ui/input-group";
import { useForgotPasswordForm } from "./model";

export function ForgotPasswordForm() {
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    onSubmit,
  } = useForgotPasswordForm();

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h2 className="text-2xl font-black">Забыли пароль</h2>

      <form className="mt-6" onSubmit={handleSubmit(onSubmit)} noValidate>
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

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mx-auto sm:w-fit sm:px-24 w-full"
                size="lg"
              >
                {isSubmitting ? "Отправляем..." : "Запросить сброс"}
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
