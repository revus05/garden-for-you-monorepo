"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signIn } from "@/entities/user";
import { useAppDispatch, useAppSelector } from "@/shared/lib";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
} from "@/shared/ui";
import { type EditProfileValues, editProfileSchema } from "./model/schema";

export function EditProfileForm() {
  const user = useAppSelector((state) => state.userSlice.user);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      phone: user?.phone ?? "",
    },
  });

  async function onSubmit(values: EditProfileValues) {
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      dispatch(signIn(data.customer));
      toast.success("Профиль обновлён");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Что-то пошло не так",
      );
    }
  }

  function handleOpenChange(val: boolean) {
    if (val && user) {
      reset({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        phone: user.phone ?? "",
      });
    }
    setOpen(val);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Pencil className="size-4" />
          Редактировать
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать профиль</DialogTitle>
        </DialogHeader>
        <form className="mt-2" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldSet>
            <FieldGroup>
              <Field data-invalid={!!errors.first_name}>
                <FieldLabel>Имя</FieldLabel>
                <FieldContent>
                  <Input placeholder="Иван" {...register("first_name")} />
                  <FieldError
                    errors={[{ message: errors.first_name?.message }]}
                  />
                </FieldContent>
              </Field>

              <Field data-invalid={!!errors.last_name}>
                <FieldLabel>Фамилия</FieldLabel>
                <FieldContent>
                  <Input placeholder="Иванов" {...register("last_name")} />
                  <FieldError
                    errors={[{ message: errors.last_name?.message }]}
                  />
                </FieldContent>
              </Field>

              <Field data-invalid={!!errors.phone}>
                <FieldLabel>Телефон</FieldLabel>
                <FieldContent>
                  <Input
                    placeholder="+375 (29) 000-00-00"
                    {...register("phone")}
                  />
                  <FieldError errors={[{ message: errors.phone?.message }]} />
                </FieldContent>
              </Field>

              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
              </Button>
            </FieldGroup>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  );
}
