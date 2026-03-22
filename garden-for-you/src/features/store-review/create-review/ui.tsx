"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createStoreReviewRequest } from "features/store-review/create-review/api";
import { PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAppSelector } from "shared/lib/hooks";
import { Button } from "shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "shared/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "shared/ui/field";
import { Rating } from "shared/ui/rating";
import { Textarea } from "shared/ui/textarea";
import { toast } from "sonner";
import { type CreateStoreReviewValues, createStoreReviewSchema } from "./model";

type CreateStoreReviewFormProps = {
  onSuccess?: () => void;
};

export function CreateStoreReviewForm({
  onSuccess,
}: CreateStoreReviewFormProps) {
  const userPhone = useAppSelector((state) => state.userSlice.user?.phone);
  const userFirstName = useAppSelector(
    (state) => state.userSlice.user?.first_name,
  );
  const userLastName = useAppSelector(
    (state) => state.userSlice.user?.last_name,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

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

  return (
    <Dialog
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (open) {
          setFormKey((k) => k + 1);
        }
      }}
      open={dialogOpen}
    >
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
                <FieldLabel>Оценка магазина</FieldLabel>
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
                    placeholder="Расскажите, что понравилось в магазине или что можно улучшить"
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
