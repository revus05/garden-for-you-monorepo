"use client";

import { Mail, MapPin, Phone, Truck, User } from "lucide-react";
import {
  Button,
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
import { cn, formatPrice } from "@/shared/lib";
import { type ShippingOption, useShippingForm } from "./model";

type Props = {
  onSuccess: (option: ShippingOption) => void;
};

export function ShippingForm({ onSuccess }: Props) {
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    onSubmit,
    watch,
    shippingOptions,
    optionsLoading,
    optionsError,
    selectOption,
  } = useShippingForm(onSuccess);

  const shippingOptionId = watch("shippingOptionId");
  const requiresAddress = watch("requiresAddress");

  function getOptionIcon(option: ShippingOption) {
    const isSelected = shippingOptionId === option.id;
    const cls = cn("h-4 w-4", isSelected ? "stroke-primary" : "stroke-muted-foreground");
    return option.type_code === "delivery" ? (
      <Truck className={cls} />
    ) : (
      <MapPin className={cls} />
    );
  }

  function formatOptionPrice(amount: number) {
    return amount === 0 ? "Бесплатно" : formatPrice(amount);
  }

  return (
    <form className="mt-2" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldSet>
        <FieldGroup>
          {/* Delivery method choice */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">
              Способ получения
            </p>

            {optionsLoading && (
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-[72px] animate-pulse rounded-xl border border-border bg-background-secondary/40"
                  />
                ))}
              </div>
            )}

            {optionsError && !optionsLoading && (
              <p className="text-sm text-destructive">{optionsError}</p>
            )}

            {!optionsLoading && shippingOptions.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {shippingOptions.map((option) => {
                  const isSelected = shippingOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectOption(option)}
                      className={cn(
                        "flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {getOptionIcon(option)}
                        <span className="text-sm font-semibold">
                          {option.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatOptionPrice(option.amount)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {errors.shippingOptionId && (
              <p className="text-sm text-destructive">
                {errors.shippingOptionId.message}
              </p>
            )}
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.firstName}>
              <FieldLabel className="flex w-full flex-col items-start">
                <span className="mb-1.5 text-sm font-medium text-foreground">
                  Имя
                </span>
                <FieldContent className="w-full">
                  <InputGroup className="gap-2 px-1 shadow-md sm:px-1.5">
                    <InputGroupAddon align="inline-start">
                      <User className="stroke-primary" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="Иван"
                      aria-invalid={!!errors.firstName}
                      className="text-primary"
                      {...register("firstName")}
                    />
                  </InputGroup>
                  <FieldError errors={[errors.firstName]} />
                </FieldContent>
              </FieldLabel>
            </Field>

            <Field data-invalid={!!errors.lastName}>
              <FieldLabel className="flex w-full flex-col items-start">
                <span className="mb-1.5 text-sm font-medium text-foreground">
                  Фамилия
                </span>
                <FieldContent className="w-full">
                  <InputGroup className="gap-2 px-1 shadow-md sm:px-1.5">
                    <InputGroupAddon align="inline-start">
                      <User className="stroke-primary" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="Иванов"
                      aria-invalid={!!errors.lastName}
                      className="text-primary"
                      {...register("lastName")}
                    />
                  </InputGroup>
                  <FieldError errors={[errors.lastName]} />
                </FieldContent>
              </FieldLabel>
            </Field>
          </div>

          <Field data-invalid={!!errors.email}>
            <FieldLabel className="flex w-full flex-col items-start">
              <span className="mb-1.5 text-sm font-medium text-foreground">
                Email
              </span>
              <FieldContent className="w-full">
                <InputGroup className="gap-2 px-1 shadow-md sm:px-1.5">
                  <InputGroupAddon align="inline-start">
                    <Mail className="stroke-primary" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="email"
                    autoComplete="email"
                    placeholder="example@gmail.com"
                    aria-invalid={!!errors.email}
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
              <span className="mb-1.5 text-sm font-medium text-foreground">
                Телефон
              </span>
              <FieldContent className="w-full">
                <InputGroup className="gap-2 px-1 shadow-md sm:px-1.5">
                  <InputGroupAddon align="inline-start">
                    <Phone className="stroke-primary" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="tel"
                    autoComplete="tel"
                    placeholder="+375 (29) 000-00-00"
                    aria-invalid={!!errors.phone}
                    className="text-primary"
                    {...register("phone")}
                  />
                </InputGroup>
                <FieldError errors={[errors.phone]} />
              </FieldContent>
            </FieldLabel>
          </Field>

          {/* Address — only for options that require it */}
          {requiresAddress && (
            <>
              <Field data-invalid={!!errors.address1}>
                <FieldLabel className="flex w-full flex-col items-start">
                  <span className="mb-1.5 text-sm font-medium text-foreground">
                    Адрес доставки
                  </span>
                  <FieldContent className="w-full">
                    <InputGroup className="gap-2 px-1 shadow-md sm:px-1.5">
                      <InputGroupAddon align="inline-start">
                        <MapPin className="stroke-primary" />
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder="ул. Ленина, д. 1, кв. 1"
                        aria-invalid={!!errors.address1}
                        className="text-primary"
                        {...register("address1")}
                      />
                    </InputGroup>
                    <FieldError errors={[errors.address1]} />
                  </FieldContent>
                </FieldLabel>
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.city}>
                  <FieldLabel className="flex w-full flex-col items-start">
                    <span className="mb-1.5 text-sm font-medium text-foreground">
                      Город
                    </span>
                    <FieldContent className="w-full">
                      <InputGroup className="gap-2 px-1 shadow-md sm:px-1.5">
                        <InputGroupInput
                          placeholder="Минск"
                          aria-invalid={!!errors.city}
                          className="text-primary"
                          {...register("city")}
                        />
                      </InputGroup>
                      <FieldError errors={[errors.city]} />
                    </FieldContent>
                  </FieldLabel>
                </Field>

                <Field data-invalid={!!errors.postalCode}>
                  <FieldLabel className="flex w-full flex-col items-start">
                    <span className="mb-1.5 text-sm font-medium text-foreground">
                      Индекс
                    </span>
                    <FieldContent className="w-full">
                      <InputGroup className="gap-2 px-1 shadow-md sm:px-1.5">
                        <InputGroupInput
                          placeholder="220000"
                          aria-invalid={!!errors.postalCode}
                          className="text-primary"
                          {...register("postalCode")}
                        />
                      </InputGroup>
                      <FieldError errors={[errors.postalCode]} />
                    </FieldContent>
                  </FieldLabel>
                </Field>
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || optionsLoading}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Сохраняем..." : "Далее — к подтверждению"}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
