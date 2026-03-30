"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PenLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { paths } from "@/shared/constants/navigation";
import { useAppSelector } from "@/shared/lib";
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
  Rating,
  Textarea,
} from "@/shared/ui";
import { createStoreReviewRequest } from "./api";
import { type CreateStoreReviewValues, createStoreReviewSchema } from "./model";

type CreateStoreReviewFormProps = {
  onSuccess?: () => void;
};

export function CreateStoreReviewForm({
  onSuccess,
}: CreateStoreReviewFormProps) {
  const user = useAppSelector((state) => state.userSlice.user);
  const userPhone = useAppSelector((state) => state.userSlice.user?.phone);
  const userFirstName = useAppSelector(
    (state) => state.userSlice.user?.first_name,
  );
  const userLastName = useAppSelector(
    (state) => state.userSlice.user?.last_name,
  );

  const [dialogOpen, setDialogOpen] = useState(false);

  const router = useRouter();
  const {
    control,
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    reset,
  } = useForm<CreateStoreReviewValues>({
    resolver: zodResolver(createStoreReviewSchema),
    defaultValues: {
      author_name:
        [userFirstName, userLastName].filter(Boolean).join(" ").trim() ||
        "Покупатель",
      phone: userPhone || "",
      rating: 5,
      message: "",
    },
  });

  async function onSubmit(values: CreateStoreReviewValues) {
    try {
      const response = await createStoreReviewRequest(values);

      toast.success(response.message);
      reset({
        author_name: values.author_name,
        phone: values.phone,
        rating: 5,
        message: "",
      });
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Что-то пошло не так",
      );
    }
  }

  if (!user) {
    return (
      <Link href={`${paths.signIn}?path=${paths.reviews}`}>
        <Button size="lg" type="button">
          <PenLine className="stroke-primary-foreground" />
          Оставить отзыв
        </Button>
      </Link>
    );
  }
  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setDialogOpen(true)} size="lg" type="button">
          <PenLine className="stroke-primary-foreground" />
          Оставить отзыв
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(92vh,800px)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый отзыв</DialogTitle>
        </DialogHeader>
        <form className="mt-2" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldSet>
            <FieldGroup>
              <input type="hidden" {...register("author_name")} />
              <input type="hidden" {...register("phone")} />

              <Field data-invalid={!!errors.rating}>
                <FieldLabel>Оцените наш магазин</FieldLabel>
                <FieldContent className="flex justify-center">
                  <Controller
                    control={control}
                    name="rating"
                    render={({ field }) => (
                      <Rating
                        disabled={isSubmitting}
                        onChange={field.onChange}
                        value={field.value}
                        className="items-center"
                      />
                    )}
                  />
                  <FieldError errors={[{ message: errors.rating?.message }]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!errors.message}>
                <FieldLabel>Текст отзыва</FieldLabel>
                <FieldContent>
                  <Textarea
                    rows={6}
                    placeholder="Расскажите, что понравилось или что можно улучшить"
                    aria-invalid={!!errors.message}
                    {...register("message")}
                  />
                  <FieldError errors={[{ message: errors.message?.message }]} />
                </FieldContent>
              </Field>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                onClick={() => setDialogOpen(false)}
              >
                {isSubmitting ? "Сохраняем..." : "Отправить отзыв"}
              </Button>
            </FieldGroup>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  );
}
