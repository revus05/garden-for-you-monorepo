import Link from "next/link";
import { Icons } from "shared/ui/icons";
import { NavItems } from "widgets/layouts/home/nav-items";
import plantsPattern from "../../../../public/image/plants-pattern.png";

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "oklch(0.3762 0.0406 142.18)",
        backgroundImage: `url(${plantsPattern.src})`,
        backgroundPosition: "center",
      }}
      className="md:py-32 py-12"
    >
      <div className="wrapper text-primary-foreground flex flex-col gap-8">
        <h2 className="font-black text-4xl">Сад Для Вас</h2>
        <div className="grid md:grid-cols-3 grid-cols-1 gap-8">
          <div className="flex flex-col gap-4">
            <Link href="#" className="underline">
              Политика конфиденциальности
            </Link>
            <Link href="#" className="underline">
              Соглашение на обработку персональных данных
            </Link>
            <Link href="#" className="underline">
              Договор оферты
            </Link>
            <span>
              ©2026 Все права защищены Крестьянское (фермерское) хозяйство “Сад
              для Вас", УНП 691532502
            </span>
          </div>
          <nav className="flex md:justify-center">
            <ul className="flex flex-col gap-2">
              <NavItems />
            </ul>
          </nav>
          <div className="flex flex-col gap-2">
            <span>
              Александр:{" "}
              <Link href="tel:+375291066556" className="hover:underline">
                +375 (29) 106-65-56
              </Link>
            </span>
            <span>
              Анатолий:{" "}
              <Link href="tel:+375297711088" className="hover:underline">
                +375 (29) 771-10-88
              </Link>
              ,{" "}
              <Link href="tel:+375447321771" className="hover:underline">
                +375 (44) 732-17-71
              </Link>
            </span>
            <div className="flex gap-2 items-center">
              <Icons.telegram className="size-8 fill-white stroke-white" />
              <Link href="https://t.me/alex_key1" className="hover:underline">
                @alex_key1
              </Link>
            </div>
            <iframe
              title="Яндекс карта"
              src="https://yandex.ru/map-widget/v1/?um=constructor%3Ae5089923a4e2685886697236ae92f5e0eb12726f30c58d73cb59846fe2a82f8e&amp;source=constructor"
              width="500"
              height="400"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
