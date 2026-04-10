"use client";

import { Scale, ShoppingCart, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/images/logo.png";
import { paths } from "@/shared/constants/navigation";
import { cn, useAppSelector } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { MobileMenu } from "./mobile-menu";
import { NavItems } from "./nav-items";
import { SearchPopover } from "./search-popover";

export const Header = () => {
  const user = useAppSelector((state) => state.userSlice.user);
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const comparisonCount = useAppSelector(
    (state) => state.comparisonSlice.products.length,
  );

  const avatarUrl = user?.metadata?.avatar_url as string | undefined;

  function UserInitials({ name }: { name: string }) {
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");

    return (
      <div className="flex size-37.5 items-center justify-center rounded-full bg-primary/10 text-4xl font-semibold text-primary">
        {initials}
      </div>
    );
  }

  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <header className="relative sm:h-17 h-23">
      <div className="fixed z-30 w-full bg-background-secondary/80 py-2 sm:py-4 backdrop-blur-2xl">
        <div className="wrapper flex sm:flex-row flex-col gap-2 items-center justify-between">
          <Link href={paths.home} className="flex items-center gap-2">
            <Image
              src={logo.src}
              height={256}
              width={256}
              alt="logo"
              className="size-8"
            />
            <h1 className="text-primary font-black font-logo text-2xl whitespace-nowrap">
              Сад Для Вас
            </h1>
          </Link>
          <nav className="lg:block hidden">
            <ul className="flex gap-8">
              <NavItems />
            </ul>
          </nav>
          <div className="grid grid-cols-[32px_1fr_32px] sm:flex gap-1 items-center sm:w-fit w-full">
            <span className="sm:hidden block"></span>
            <div className="flex gap-1 items-center justify-center max-w-full">
              <SearchPopover />
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={paths.compare}
                  className="relative"
                  aria-label="Сравнение"
                >
                  <Scale />
                  {comparisonCount > 0 && (
                    <div className="absolute size-4 top-0 right-0 translate-x-1 -translate-y-1 rounded-full bg-primary flex justify-center items-center">
                      <span className="text-xs font-medium text-primary-foreground">
                        {comparisonCount}
                      </span>
                    </div>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href={paths.cart} className="relative">
                  <ShoppingCart />
                  {cart?.items && cart?.items?.length > 0 && (
                    <div className="absolute size-4 top-0 right-0 translate-x-1 -translate-y-1 rounded-full bg-red-500 flex justify-center items-center">
                      <span className="text-xs font-medium text-primary-foreground">
                        {cart.items.length}
                      </span>
                    </div>
                  )}
                </Link>
              </Button>
              {user ? (
                <Button
                  variant="ghost"
                  size={user ? "default" : "icon"}
                  asChild
                >
                  <Link
                    href={paths.profile}
                    aria-label="Профиль"
                    className={cn(
                      "min-w-0 flex items-center gap-1",
                      avatarUrl && "px-1",
                    )}
                  >
                    {user.first_name && (
                      <span className="hidden sm:block truncate max-w-16">
                        {user.first_name}
                      </span>
                    )}

                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        width={24}
                        height={24}
                        className="rounded-full border object-cover size-6 shrink-0"
                        alt="Фото профиля"
                      />
                    ) : (
                      <UserInitials name={fullName} />
                    )}
                  </Link>
                </Button>
              ) : (
                <Link
                  href={paths.signIn}
                  aria-label="Войти"
                  className="size-8 flex items-center justify-center"
                >
                  <User className="size-4" />
                </Link>
              )}
            </div>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
