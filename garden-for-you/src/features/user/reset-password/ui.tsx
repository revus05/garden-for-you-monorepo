"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createElement, useState } from "react";
import { useForm } from "react-hook-form";
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
import { toast } from "sonner";
import { resetPasswordRequest } from "./api";
import { type ResetPasswordValues, resetPasswordSchema } from "./model";

const largeInputGroupClassName =
  "h-17 sm:gap-8 gap-4 rounded-[20px] bg-background-secondary sm:px-5 px-3 text-[20px] shadow-md";
const largeInputClassName =
  "h-full px-0 text-[20px] text-primary placeholder:text-[#184A2C]/78 md:text-[20px]";
const largeIconClassName = "size-8 stroke-primary";
const passwordToggleClassName =
  "size-17 rounded-none border-0 bg-background-secondary text-primary shadow-none hover:bg-background-secondary";
const passwordGroupClassName =
  "w-full overflow-hidden rounded-[20px] border border-input bg-background-secondary shadow-md";
const passwordGroupErrorClassName =
  "border-destructive dark:border-destructive/50";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token")?.trim() ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      repeatPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    try {
      const response = await resetPasswordRequest({
        ...values,
        token,
      });

      toast.success(response.message);
      router.push(paths.signIn);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Что-то пошло не так",
      );
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[740px] flex-col gap-10 px-4 py-10">
      <h2 className="text-center text-2xl font-black">Сброс пароля</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldGroup>
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
                      className={cn(
                        largeInputGroupClassName,
                        "rounded-none border-0 bg-transparent shadow-none",
                      )}
                    >
                      <InputGroupAddon align="inline-start">
                        <Icons.lock className={largeIconClassName} />
                      </InputGroupAddon>
                      <InputGroupInput
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                        placeholder={showPassword ? "StrongPassword" : "••••••••"}
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
                        className: largeIconClassName,
                      })}
                    </Button>
                  </ButtonGroup>
                  <FieldError errors={[{ message: errors.password?.message }]} />
                </FieldContent>
              </FieldLabel>
            </Field>

            <Field data-invalid={!!errors.repeatPassword}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <ButtonGroup
                    className={cn(
                      passwordGroupClassName,
                      errors.repeatPassword && passwordGroupErrorClassName,
                    )}
                  >
                    <InputGroup
                      className={cn(
                        largeInputGroupClassName,
                        "rounded-none border-0 bg-transparent shadow-none",
                      )}
                    >
                      <InputGroupAddon align="inline-start">
                        <Icons.lock className={largeIconClassName} />
                      </InputGroupAddon>
                      <InputGroupInput
                        type={showRepeatPassword ? "text" : "password"}
                        autoComplete="new-password"
                        aria-invalid={!!errors.repeatPassword}
                        placeholder={
                          showRepeatPassword ? "StrongPassword" : "••••••••"
                        }
                        className={largeInputClassName}
                        {...register("repeatPassword")}
                      />
                    </InputGroup>
                    <Button
                      onClick={() => setShowRepeatPassword((prev) => !prev)}
                      size="icon"
                      type="button"
                      variant="outline"
                      className={passwordToggleClassName}
                    >
                      {createElement(
                        Icons[showRepeatPassword ? "eyeOff" : "eye"],
                        { className: largeIconClassName },
                      )}
                    </Button>
                  </ButtonGroup>
                  <FieldError
                    errors={[{ message: errors.repeatPassword?.message }]}
                  />
                </FieldContent>
              </FieldLabel>
            </Field>

            {!token ? (
              <p className="text-center text-sm text-destructive">
                Ссылка для сброса недействительна или неполная.
              </p>
            ) : null}

            <div className="flex flex-col gap-1">
              <Button
                type="submit"
                disabled={isSubmitting || !token}
                className="mx-auto sm:w-fit sm:px-32 w-full bg-[#184a2c] hover:bg-[#184a2c]/90 h-12.5"
                size="lg"
              >
                {isSubmitting ? "Сохраняем..." : "Сменить пароль"}
              </Button>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Вспомнили пароль?{" "}
                <Link
                  className="text-primary underline underline-offset-4"
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
