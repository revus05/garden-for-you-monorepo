"use client";

import { Scale, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { paths } from "@/shared/constants/navigation";
import { useAppSelector } from "@/shared/lib";
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
                <User />
              </Link>
            </Button>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
