import { Skeleton } from "@/shared/ui";

export const CatalogProductSkeleton = () => (
  <div className="flex flex-col rounded-lg border">
    <Skeleton className="w-full aspect-square rounded-t-[9px] rounded-b-none" />
    <div className="flex flex-col gap-2 p-2">
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between items-center mt-1">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="size-10 rounded-md" />
      </div>
    </div>
  </div>
);
