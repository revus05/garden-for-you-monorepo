import Image from "next/image";
import Link from "next/link";
import plantsPattern from "@/images/plants-pattern.png";
import telegram from "@/images/telegram.svg";
import { paths } from "@/shared/constants/navigation";
import { NavItems } from "./nav-items";

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
      <div className="wrapper text-primary-foreground grid md:grid-cols-3 grid-cols-1 gap-8">
        <div className="flex flex-col gap-8">
          <h2 className="font-black text-4xl">Сад Для Вас</h2>
          <div className="flex flex-col gap-4">
            <Link href={paths.privacyPolicy} className="underline">
              Политика конфиденциальности
            </Link>
            <Link href={paths.offerAgreement} className="underline">
              Договор оферты
            </Link>
            <span>
              ©2026 Все права защищены Крестьянское (фермерское) хозяйство “Сад
              для Вас", УНП 691532502
            </span>
          </div>
        </div>
        <nav className="flex md:justify-center">
          <ul className="flex flex-col gap-2 [&_a]:font-normal [&_a]:text-primary-foreground">
            <NavItems />
          </ul>
        </nav>
        <div className="flex flex-col gap-2">
          <iframe
            title="Яндекс карта"
            src="https://yandex.ru/map-widget/v1/?um=constructor%3Ae5089923a4e2685886697236ae92f5e0eb12726f30c58d73cb59846fe2a82f8e&amp;source=constructor"
            width="500"
            height="300"
            className="w-full"
          />
          <div className="flex gap-2 items-center">
            <span>
              Александр:{" "}
              <Link href="tel:+375291066556" className="hover:underline">
                +375 (29) 106-65-56
              </Link>
            </span>
            <Link href="https://t.me/alex_key1" className="hover:underline">
              <Image src={telegram} width={32} height={32} alt="telegram" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
