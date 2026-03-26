"use client";

import { StarIcon } from "lucide-react";
import { type FC, useState } from "react";
import { cn } from "@/shared/lib";

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
};

const LABELS: Record<number, string> = {
  1: "Очень плохо",
  2: "Плохо",
  3: "Нормально",
  4: "Хорошо",
  5: "Отлично",
};

export const Rating: FC<StarRatingInputProps> = ({
  value,
  onChange,
  disabled,
  id,
  className,
}) => {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <fieldset
        className="flex flex-wrap items-center gap-1.5 border-0 p-0"
        id={id}
      >
        <legend className="sr-only">Оценка от 1 до 5</legend>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            className={cn(
              "rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50",
            )}
            disabled={disabled}
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            type="button"
            aria-label={`${star} из 5`}
            aria-pressed={value === star}
          >
            <StarIcon
              className={cn(
                "size-9 sm:size-10 transition-colors stroke-primary",
                display >= star
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/50",
              )}
            />
          </button>
        ))}
      </fieldset>
      {display >= 1 && display <= 5 ? (
        <p className="text-sm font-medium text-primary">{LABELS[display]}</p>
      ) : (
        <p className="text-sm text-muted-foreground">Выберите оценку</p>
      )}
    </div>
  );
};
