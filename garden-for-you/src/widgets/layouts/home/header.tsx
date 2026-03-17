"use client";

import Link from "next/link";
import { useAppSelector } from "shared/lib/hooks";
import { paths } from "shared/navigation";
import { Button } from "shared/ui/button";
import { Icons } from "shared/ui/icons";

export const Header = () => {
  const user = useAppSelector((state) => state.userSlice.user);

  return (
    <header className="py-4">
      <div className="wrapper flex items-center justify-between">
        <Link href={paths.home}>
          <h1 className="text-primary font-black text-3xl">Сад Для Вас</h1>
        </Link>
        <nav>
          <ul className="flex gap-8">
            <li>
              <Link href={paths.home}>Главная</Link>
            </li>
            <li>
              <Link href={paths.home}>О нас</Link>
            </li>
            <li>
              <Link href={paths.home}>Оплата и доставка</Link>
            </li>
            <li>
              <Link href={paths.home}>Отзывы</Link>
            </li>
            <li>
              <Link href={paths.home}>Блог</Link>
            </li>
          </ul>
        </nav>
        <div className="flex gap-1 items-center">
          <Button variant="ghost" size="icon">
            <Icons.search />
          </Button>
          <Button variant="ghost" size="icon">
            <Icons.cart />
          </Button>
          <Button variant="ghost" size={user ? "default" : "icon"} asChild>
            <Link
              href={user ? paths.profile : paths.signIn}
              aria-label={user ? "Профиль" : "Войти"}
            >
              {user && <span>{user.first_name}</span>}
              <Icons.user />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
