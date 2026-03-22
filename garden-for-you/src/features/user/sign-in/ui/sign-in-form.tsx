"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "entities/user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createElement, useState } from "react";
import { useForm } from "react-hook-form";
import { paths } from "shared/constants/navigation";
import { useAppDispatch } from "shared/lib/hooks";
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
import { toast } from "sonner";
import { signInRequest } from "../api";
import { type SignInValues, signInSchema } from "../model/schema";

const largeInputClassName =
  "h-full px-0 text-[20px] text-primary placeholder:text-[#184A2C]/78 md:text-[20px]";
const passwordToggleClassName =
  "size-17 rounded-none border-0 bg-background-secondary text-primary shadow-none hover:bg-background-secondary";
const passwordGroupClassName =
  "w-full overflow-hidden rounded-[20px] border border-input bg-background-secondary shadow-md";
const passwordGroupErrorClassName =
  "border-destructive dark:border-destructive/50";

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
    <div className="mx-auto w-full max-w-[740px] px-4 py-10">
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
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <InputGroup
                    className={
                      "h-17 sm:gap-8 gap-4 rounded-[20px] bg-background-secondary sm:px-5 px-3 text-[20px] shadow-md"
                    }
                  >
                    <InputGroupAddon align="inline-start">
                      <Icons.credentials className="size-8 stroke-primary" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="email"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      placeholder="example@gmail.com"
                      className={largeInputClassName}
                      {...register("email")}
                    />
                  </InputGroup>
                  <FieldError errors={[{ message: errors.email?.message }]} />
                </FieldContent>
              </FieldLabel>
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <ButtonGroup
                    className={cn(
                      passwordGroupClassName,
                      errors.password && passwordGroupErrorClassName,
                    )}
                  >
                    <InputGroup
                      className={
                        "h-17 sm:gap-8 gap-4 rounded-[20px] bg-background-secondary sm:px-5 px-3 text-[20px] shadow-md"
                      }
                    >
                      <InputGroupAddon align="inline-start">
                        <Icons.lock className={"size-8 stroke-primary"} />
                      </InputGroupAddon>
                      <InputGroupInput
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        aria-invalid={!!errors.password}
                        placeholder={
                          showPassword ? "StrongPassword" : "••••••••"
                        }
                        className={largeInputClassName}
                        {...register("password")}
                      />
                    </InputGroup>
                    <Button
                      onClick={() => setShowPassword((prev) => !prev)}
                      size="icon"
                      type="button"
                      variant="outline"
                      className={passwordToggleClassName}
                    >
                      {createElement(Icons[showPassword ? "eyeOff" : "eye"], {
                        className: "size-8 stroke-primary",
                      })}
                    </Button>
                  </ButtonGroup>
                  <FieldError
                    errors={[{ message: errors.password?.message }]}
                  />
                </FieldContent>
              </FieldLabel>
            </Field>

            <Link
              className="underline underline-offset-4 mt-1 text-sm text-muted-foreground"
              href={paths.forgotPassword}
            >
              Забыли пароль?
            </Link>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mx-auto sm:w-fit sm:px-32 w-full bg-[#184a2c] hover:bg-[#184a2c]/90 h-12.5"
              size="lg"
            >
              {isSubmitting ? "Входим..." : "Войти"}
            </Button>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
