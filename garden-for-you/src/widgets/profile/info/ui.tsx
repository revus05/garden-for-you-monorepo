"use client";

import type { HttpTypes } from "@medusajs/types";
import { useQuery } from "@tanstack/react-query";
import {
  Camera,
  History,
  LogOut,
  Mail,
  Package,
  Phone,
  User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { signIn, signOut } from "@/entities/user";
import { EditProfileForm } from "@/features/profile/edit-profile";
import { paths } from "@/shared/constants/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/lib";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";

type StoreOrder = HttpTypes.StoreOrder;

function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "В обработке",
    completed: "Завершён",
    cancelled: "Отменён",
    archived: "Архивирован",
    requires_action: "Требует действия",
  };
  return labels[status] ?? status;
}

function getOrderStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "completed") return "default";
  if (status === "cancelled") return "destructive";
  return "outline";
}

function formatCurrency(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function UserInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  return (
    <div className="flex size-37.5 items-center justify-center rounded-full bg-primary/10 text-4xl font-semibold text-primary">
      {initials || <User className="size-12 text-muted-foreground" />}
    </div>
  );
}

export const ProfileInfo = () => {
  const user = useAppSelector((state) => state.userSlice.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      return (await res.json()) as Promise<{ orders: StoreOrder[] }>;
    },
  });

  useEffect(() => {
    if (!user) {
      router.push(paths.signIn);
    }
  }, [user, router]);

  if (!user) return null;

  const avatarUrl = user.metadata?.avatar_url as string | undefined;
  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || "Покупатель";
  const orders = ordersData?.orders ?? [];

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл слишком большой. Максимум 5 МБ.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error((data.message as string) ?? "Ошибка загрузки аватара");
        return;
      }

      dispatch(signIn(data.customer));
      toast.success("Аватар обновлён");
    } catch {
      toast.error("Ошибка загрузки аватара");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      dispatch(signOut());
      void router.push(paths.home);
    } catch {
      toast.error("Ошибка при выходе из аккаунта");
      setIsSigningOut(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold">Профиль</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-4 rounded-xl border p-6">
          <div className="group relative">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                width={150}
                height={150}
                className="rounded-full border object-cover"
                style={{ width: 150, height: 150 }}
                alt="Фото профиля"
              />
            ) : (
              <UserInitials name={fullName} />
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
              aria-label="Загрузить фото"
            >
              {isUploadingAvatar ? (
                <div className="size-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Camera className="size-8 text-white" />
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="text-center">
            <p className="text-lg font-semibold">{fullName}</p>
            <p className="text-sm text-muted-foreground">Покупатель</p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="text-sm text-primary underline-offset-4 hover:underline disabled:opacity-50"
          >
            {isUploadingAvatar ? "Загрузка..." : "Изменить фото"}
          </button>
        </div>

        <div className="flex flex-col gap-5 rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Данные профиля</h2>
            <EditProfileForm />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Имя</p>
                <p className="font-medium">{fullName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Телефон</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="mt-auto w-fit"
                disabled={isSigningOut}
              >
                <LogOut className="size-4" />
                {isSigningOut ? "Выход..." : "Выйти из аккаунта"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Выйти из аккаунта?</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы будете перенаправлены на главную страницу.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="secondary" size="sm" className="mt-auto">
                    Отмена
                  </Button>
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleSignOut}
                >
                  Выйти
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <History className="size-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">История заказов</h2>
        </div>

        <div className="rounded-xl border">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm">Загрузка заказов...</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Package className="size-10 stroke-primary" />
              <p className="text-sm text-primary">У вас пока нет заказов</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заказ</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Товары</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.display_id}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(String(order.created_at))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getOrderStatusVariant(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.items?.length ?? 0} поз.
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.total, order.currency_code)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};
