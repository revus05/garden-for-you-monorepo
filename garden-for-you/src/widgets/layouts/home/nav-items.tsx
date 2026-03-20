import Link from "next/link";
import { paths } from "shared/navigation";

type NavItemsProps = {
  onItemClick?: () => void;
};

export const NavItems = ({ onItemClick }: NavItemsProps) => {
  return (
    <>
      <li>
        <Link href={paths.home} onClick={onItemClick}>
          Главная
        </Link>
      </li>
      <li>
        <Link href={paths.home} onClick={onItemClick}>
          О нас
        </Link>
      </li>
      <li>
        <Link href={paths.home} onClick={onItemClick}>
          Оплата и доставка
        </Link>
      </li>
      <li>
        <Link href={paths.home} onClick={onItemClick}>
          Отзывы
        </Link>
      </li>
      <li>
        <Link href={paths.home} onClick={onItemClick}>
          Блог
        </Link>
      </li>
    </>
  );
};
