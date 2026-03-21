"use client";

import Link from "next/link";
import { paths } from "shared/constants/navigation";
import { useAppSelector } from "shared/lib/hooks";
import { Button } from "shared/ui/button";
import { Icons } from "shared/ui/icons";
import { MobileMenu } from "./mobile-menu";
import { NavItems } from "./nav-items";

export const Header = () => {
  const user = useAppSelector((state) => state.userSlice.user);
  const cart = useAppSelector((state) => state.cartSlice.cart);

  return (
    <header className="relative sm:h-17 h-23">
      <div className="fixed z-30 w-full bg-background-secondary/80 py-2 sm:py-4 backdrop-blur-2xl">
        <div className="wrapper flex sm:flex-row flex-col gap-2 items-center justify-between">
          <Link href={paths.home}>
            <h1 className="text-primary font-black text-3xl whitespace-nowrap">
              Сад Для Вас
            </h1>
          </Link>
          <nav className="lg:block hidden">
            <ul className="flex gap-8">
              <NavItems />
            </ul>
          </nav>
          <div className="flex gap-1 items-center">
            <Button variant="ghost" size="icon">
              <Icons.search />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={paths.cart} className="relative">
                <Icons.cart />
                {cart?.items && cart?.items?.length > 0 && (
                  <div className="absolute size-4 top-0 right-0 translate-x-1 -translate-y-1 rounded-full bg-red-500 flex justify-center items-center">
                    <span className="text-xs font-medium text-primary-foreground">
                      {cart.items.length}
                    </span>
                  </div>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size={user ? "default" : "icon"} asChild>
              <Link
                href={user ? paths.profile : paths.signIn}
                aria-label={user ? "Профиль" : "Войти"}
              >
                {user?.first_name && (
                  <span>
                    {user.first_name.length > 20
                      ? `${user.first_name.substring(0, 19)}...`
                      : user.first_name}
                  </span>
                )}
                <Icons.user />
              </Link>
            </Button>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
