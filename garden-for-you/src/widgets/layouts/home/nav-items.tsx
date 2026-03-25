"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { paths } from "@/shared/constants/navigation";
import { cn } from "@/shared/lib";

type NavItemsProps = {
  onItemClick?: () => void;
};

export const NavItems = ({ onItemClick }: NavItemsProps) => {
  const pathname = usePathname();

  return (
    <>
      <li>
        <Link
          href={paths.home}
          onClick={onItemClick}
          className={cn(pathname === paths.home && "font-bold text-primary")}
        >
          Главная
        </Link>
      </li>
      <li>
        <Link
          href={paths.aboutUs}
          onClick={onItemClick}
          className={cn(
            pathname?.includes(paths.aboutUs) && "font-bold text-primary",
          )}
        >
          О нас
        </Link>
      </li>
      <li>
        <Link
          href={paths.paymentAndShipping}
          onClick={onItemClick}
          className={cn(
            pathname?.includes(paths.paymentAndShipping) &&
              "font-bold text-primary",
          )}
        >
          Оплата и доставка
        </Link>
      </li>
      <li>
        <Link
          href={paths.reviews}
          onClick={onItemClick}
          className={cn(
            pathname?.includes(paths.reviews) && "font-bold text-primary",
          )}
        >
          Отзывы
        </Link>
      </li>
      <li>
        <Link
          href={paths.blog}
          onClick={onItemClick}
          className={cn(
            pathname?.includes(paths.blog) && "font-bold text-primary",
          )}
        >
          Блог
        </Link>
      </li>
      <li>
        <Link
          href={paths.contacts}
          onClick={onItemClick}
          className={cn(
            pathname?.includes(paths.contacts) && "font-bold text-primary",
          )}
        >
          Контакты
        </Link>
      </li>
    </>
  );
};
