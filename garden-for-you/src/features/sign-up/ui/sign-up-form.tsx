"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "entities/user";
import { Phone } from "lucide-react";
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
import { signUpRequest } from "../api/sign-up";
import { type SignUpValues, signUpSchema } from "../model/schema";

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

export function SignUpForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

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
    try {
      const customer = await signUpRequest(values);
      dispatch(signIn(customer));

      router.push(paths.home);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не удалось зарегистрироваться. Проверьте данные и попробуйте снова.",
      );
    }
  }

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = form;

  return (
    <div className="mx-auto flex w-full max-w-[740px] flex-col gap-10 px-4 py-10">
      <h2 className="text-center text-2xl font-black">Регистрация</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldGroup>
            <Field data-invalid={!!errors.first_name}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <InputGroup className={largeInputGroupClassName}>
                    <InputGroupAddon align="inline-start">
                      <Icons.userForForm className="size-8 stroke-none" />
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-invalid={!!errors.first_name}
                      placeholder="Введите ваше имя"
                      className={largeInputClassName}
                      {...register("first_name")}
                    />
                  </InputGroup>
                  <FieldError
                    errors={[{ message: errors.first_name?.message }]}
                  />
                </FieldContent>
              </FieldLabel>
            </Field>

            <Field data-invalid={!!errors.last_name}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <InputGroup className={largeInputGroupClassName}>
                    <InputGroupAddon align="inline-start">
                      <Icons.userForForm className={largeIconClassName} />
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-invalid={!!errors.last_name}
                      placeholder="Введите вашу фамилию"
                      className={largeInputClassName}
                      {...register("last_name")}
                    />
                  </InputGroup>
                  <FieldError
                    errors={[{ message: errors.last_name?.message }]}
                  />
                </FieldContent>
              </FieldLabel>
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <InputGroup className={largeInputGroupClassName}>
                    <InputGroupAddon align="inline-start">
                      <Icons.credentials className={largeIconClassName} />
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

            <Field data-invalid={!!errors.phone}>
              <FieldLabel className="flex w-full flex-col items-start">
                <FieldContent className="w-full">
                  <InputGroup className={largeInputGroupClassName}>
                    <InputGroupAddon align="inline-start">
                      <Phone
                        className={cn(
                          largeIconClassName,
                          "fill-[#184a2c] stroke-[#184a2c]",
                        )}
                      />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="tel"
                      autoComplete="tel"
                      aria-invalid={!!errors.phone}
                      placeholder="+375 (29) 123-45-67"
                      className={largeInputClassName}
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
                        className: largeIconClassName,
                      })}
                    </Button>
                  </ButtonGroup>
                  <FieldError
                    errors={[{ message: errors.password?.message }]}
                  />
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

            <div className="flex flex-col gap-1">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mx-auto sm:w-fit sm:px-32 w-full bg-[#184a2c] hover:bg-[#184a2c]/90 h-12.5"
                size="lg"
              >
                {isSubmitting ? "Создаем..." : "Создать аккаунт"}
              </Button>
              <p className="mt-1 text-sm text-muted-foreground text-center">
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
