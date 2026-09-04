import Image from "next/image";
import Link from "next/link";
import logo from "@/images/logo-light.png";
import plantsPattern from "@/images/plants-pattern.png";
import telegram from "@/images/telegram.svg";
import { paths } from "@/shared/constants/navigation";
import { TelegramModal } from "@/shared/ui";
import { NavItems } from "./nav-items";
import { YandexMap } from "./yandex-map";

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
          <Link href={paths.home} className="flex items-center gap-2">
            <Image
              src={logo.src}
              height={256}
              width={256}
              alt="logo"
              className="size-10"
            />
            <span className="font-black font-logo text-2xl whitespace-nowrap">
              Сад Для Вас
            </span>
          </Link>
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
          <YandexMap />
          <div className="flex gap-2 items-center">
            <span>
              Александр:{" "}
              <Link href="tel:+375291066556" className="hover:underline">
                +375 (29) 106-65-56
              </Link>
            </span>
            <TelegramModal telegramUrl="https://t.me/alex_key1">
              <button
                type="button"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Image src={telegram} width={32} height={32} alt="telegram" />
              </button>
            </TelegramModal>
          </div>
          <div className="flex gap-2 items-center">
            <span>
              Сергей:{" "}
              <Link href="tel:+375447721633" className="hover:underline">
                +375 (44) 772-16-33
              </Link>
            </span>
            <TelegramModal telegramUrl="https://t.me/SBerd91">
              <button
                type="button"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Image src={telegram} width={32} height={32} alt="telegram" />
              </button>
            </TelegramModal>
          </div>
          <div className="flex gap-2 items-center">
            <span>
              Анатолий:{" "}
              <Link href="tel:+375297711088" className="hover:underline">
                +375 (29) 771-10-88
              </Link>
            </span>
            <TelegramModal telegramUrl="https://t.me/anatolijber1">
              <button
                type="button"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Image src={telegram} width={32} height={32} alt="telegram" />
              </button>
            </TelegramModal>
          </div>
        </div>
      </div>
    </footer>
  );
};
