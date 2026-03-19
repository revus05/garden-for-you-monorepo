import Link from "next/link";
import { paths } from "shared/navigation";

export const NavItems = () => {
  return (
    <>
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
    </>
  );
};
