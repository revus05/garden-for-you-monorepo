"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordRequest } from "features/user/forgot-password/api";
import { useForm } from "react-hook-form";
import { Button } from "shared/ui/button";
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
import { type ForgotPasswordValues, forgotPasswordSchema } from "./model";

const largeInputClassName =
  "h-full px-0 text-[20px] text-primary placeholder:text-[#184A2C]/78 md:text-[20px]";

export function ForgotPasswordForm() {
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      const response = await forgotPasswordRequest(values);

      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Что-то пошло не так",
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-[740px] px-4 py-10">
      <h2 className="text-2xl font-black">Забыли пароль</h2>

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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mx-auto sm:w-fit sm:px-32 w-full bg-[#184a2c] hover:bg-[#184a2c]/90 h-12.5"
              size="lg"
            >
              {isSubmitting ? "Отправляем..." : "Запросить сброс"}
            </Button>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
