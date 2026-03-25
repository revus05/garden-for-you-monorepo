import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { getSiteConfig } from "@/entities/site-config/server";
import { withHomeLayout } from "@/widgets/layouts/home";

const ContactsPage = async () => {
  const configs = await getSiteConfig();
  const workSchedule = configs.work_schedule ?? "";
  const scheduleLines = workSchedule
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="wrapper py-12 flex flex-col gap-8">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Контакты</h1>
        <p className="text-muted-foreground text-lg">
          Свяжитесь с нами или приходите в магазин «Сад для вас»
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_3fr] grid-cols-1 gap-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 items-center">
            <MapPin className="size-8 stroke-primary" />
            <span className="text-center">
              Республика Беларусь, Минская обл., Минский р-н., 22-ой км трассы Р
              23 Минск – Микашевичи или 13 км от Минска, остановка Белица на
              трассе Р 23
            </span>
          </div>

          <div className="flex flex-col gap-2 items-center">
            <Mail className="size-8 stroke-primary" />
            <span className="text-center">saddlyavas@gmail.com</span>
          </div>

          <div className="flex flex-col gap-2 items-center">
            <Phone className="size-8 stroke-primary" />
            <span className="text-center">
              Анатолий:{" "}
              <Link href="tel:+375297711088" className="hover:underline">
                +375 (29) 771-10-88
              </Link>
              ,{" "}
              <Link href="tel:+375447321771" className="hover:underline">
                +375 (44) 732-17-71
              </Link>
            </span>
          </div>
        </div>

        <iframe
          title="Яндекс карта"
          src="https://yandex.ru/map-widget/v1/?um=constructor%3Ae5089923a4e2685886697236ae92f5e0eb12726f30c58d73cb59846fe2a82f8e&amp;source=constructor"
          className="w-full h-full rounded-xl"
        />
      </div>

      <div className="max-w-2xl mx-auto flex flex-col gap-6 items-center">
        {scheduleLines.length > 0 && (
          <>
            <span className="flex items-center gap-2 text-xl">
              <Clock className="w-5 h-5 text-green-600" />
              График работы
            </span>
            <ul className="flex flex-col gap-2 text-[15px]">
              {scheduleLines.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-green-600 font-medium">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default withHomeLayout(ContactsPage);
