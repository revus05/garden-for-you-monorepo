"use client";

import { Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { createElement, useState } from "react";
import { paths } from "shared/constants/navigation";
import { cn } from "shared/lib/utils";
import { Button } from "shared/ui/button";
import { ButtonGroup } from "shared/ui/button-group";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "shared/ui/field";
import { Icons } from "shared/ui/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "shared/ui/input-group";
import { useSignUpForm } from "./model";

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    onSubmit,
  } = useSignUpForm();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10">
      <h2 className="text-2xl font-black">Регистрация</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldGroup>
            <Field data-invalid={!!errors.first_name}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <InputGroup className="gap-2 sm:px-1.5 px-1 shadow-md">
                    <InputGroupAddon align="inline-start">
                      <User className="stroke-primary" />
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-invalid={!!errors.first_name}
                      placeholder="Введите ваше имя"
                      className="text-primary"
                      {...register("first_name")}
                    />
                  </InputGroup>
                  <FieldError errors={[errors.first_name]} />
                </FieldContent>
              </FieldLabel>
            </Field>

            <Field data-invalid={!!errors.last_name}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <InputGroup className="gap-2 sm:px-1.5 px-1 shadow-md">
                    <InputGroupAddon align="inline-start">
                      <User className="stroke-primary" />
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-invalid={!!errors.last_name}
                      placeholder="Введите вашу фамилию"
                      className="text-primary"
                      {...register("last_name")}
                    />
                  </InputGroup>
                  <FieldError errors={[errors.last_name]} />
                </FieldContent>
              </FieldLabel>
            </Field>

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

            <Field data-invalid={!!errors.phone}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <InputGroup className="gap-2 sm:px-1.5 px-1 shadow-md">
                    <InputGroupAddon align="inline-start">
                      <Phone className="stroke-primary" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="tel"
                      autoComplete="tel"
                      aria-invalid={!!errors.phone}
                      placeholder="+375 (29) 123-45-67"
                      className="text-primary"
                      {...register("phone")}
                    />
                  </InputGroup>
                  <FieldError errors={[{ message: errors.phone?.message }]} />
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
                      {createElement(Icons[showPassword ? "eyeOff" : "eye"], {
                        className: "stroke-primary",
                      })}
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
                      {createElement(
                        Icons[showRepeatPassword ? "eyeOff" : "eye"],
                        {
                          className: "stroke-primary",
                        },
                      )}
                    </Button>
                  </ButtonGroup>
                  <FieldError errors={[errors.repeatPassword]} />
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
                {isSubmitting ? "Создаем..." : "Создать аккаунт"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Уже есть аккаунт?{" "}
                <Link
                  className="underline underline-offset-4 text-primary"
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
