"use client";

import { useState } from "react";
import { cn } from "@/shared/lib";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";

export const PaymentAndShippingStaticContent = () => {
  const [tab, setTab] = useState("payment-cash");

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Оплата и доставка
        </h1>
        <p className="text-muted-foreground text-lg">
          Условия оплаты и доставки товаров в магазине «Сад для вас»
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="w-full grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8"
        orientation="vertical"
      >
        <TabsList className="flex flex-col w-full h-auto p-1 rounded-xl sticky top-6">
          <div className="w-full">
            <TabsTrigger
              value="payment"
              className={cn(
                "justify-start text-left py-3.5 px-5 w-full font-medium relative overflow-hidden disabled:opacity-100",
                tab.includes("payment") &&
                  "bg-background shadow-sm [&_>_div]:block!",
              )}
              disabled
            >
              <div className="hidden absolute top-0 left-0 h-full w-1 bg-primary rounded-full" />
              Способы оплаты
            </TabsTrigger>
            <div className="pl-6">
              <TabsTrigger
                value="payment-cash"
                className="justify-start text-left py-3.5 px-5 w-full"
              >
                Наличными при получении
              </TabsTrigger>
              <TabsTrigger
                value="payment-cart-online"
                className="justify-start text-left py-3.5 px-5 w-full"
              >
                Банковской картой онлайн
              </TabsTrigger>
              <TabsTrigger
                value="payment-pickup"
                className="justify-start text-left py-3.5 px-5 w-full"
              >
                Наличными или картой в пункте самовывоза
              </TabsTrigger>
            </div>
          </div>
          <TabsTrigger
            value="delivery"
            className="justify-start text-left py-3.5 px-5 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium relative overflow-hidden data-[state=active]:[&_>_div]:block!"
          >
            <div className="hidden absolute top-0 left-0 h-full w-1 bg-primary rounded-full" />
            Условия доставки
          </TabsTrigger>
          <TabsTrigger
            value="how-to-order"
            className="justify-start text-left py-3.5 px-5 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium relative overflow-hidden data-[state=active]:[&_>_div]:block!"
          >
            <div className="hidden absolute top-0 left-0 h-full w-1 bg-primary rounded-full" />
            Как оформить заказ
          </TabsTrigger>
          <TabsTrigger
            value="pickup"
            className="justify-start text-left py-3.5 px-5 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium relative overflow-hidden data-[state=active]:[&_>_div]:block!"
          >
            <div className="hidden absolute top-0 left-0 h-full w-1 bg-primary rounded-full" />
            Самовывоз
          </TabsTrigger>
        </TabsList>

        <div className="text-justify">
          <TabsContent value="payment-cash" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Оплата наличными при получении
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-[15px]">
                <span>
                  Оплата производится курьеру в момент передачи товара.
                  Пожалуйста, подготовьте необходимую сумму без сдачи (по
                  возможности). При получении предоставляется товарный чек,
                  подтверждающий оплату.
                </span>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-cart-online" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Оплата банковской картой онлайн
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 text-[15px]">
                <span>
                  Оплата производится через интернет в режиме реального времени
                  непосредственно после оформления заказа. При онлайн-оплате
                  банковской картой платёжным документом является чек,
                  приходящий в момент онлайн-оплаты от провайдера электронных
                  платежей на электронный адрес, и доступный в личном кабинете в
                  истории заказов.
                </span>
                <span>
                  Обработка платежа производится на программно-аппаратном
                  комплексе системы электронных платежей с использованием
                  защищенного протокола передачи данных на платежный сервер.
                </span>
                <div className="flex flex-col gap-3">
                  <span>
                    Порядок проведения оплаты заказа банковской картой в сети
                    интернет:
                  </span>
                  <ul className="flex flex-col gap-4">
                    <li className="flex gap-3">
                      <span className="text-green-600 font-medium">•</span>{" "}
                      Проверьте, предназначена ли банковская карта для оплаты в
                      интернете (эту информацию предоставит Банк, выпустивший
                      Вашу пластиковую карту).
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-medium">•</span>{" "}
                      Добавьте интересующие Вас товары «В КОРЗИНУ» и нажмите
                      кнопку «Перейти к оформлению». В списке «Способы оплаты»
                      выберите пункты «Онлайн» – «Банковской картой». Заполните
                      данные по доставке и нажмите кнопку «Оформить заказ». Ваш
                      заказ поступит к нам в обработку, для оплаты товара
                      нажмите кнопку «Перейти к оплате».
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-medium">•</span>{" "}
                      Интернет-магазин переадресует Вас на авторизационный
                      сервер онлайн-платежей.
                    </li>
                  </ul>
                </div>
                <span>
                  В случае отказа клиента от товара денежные средства
                  возвращаются в полном размере и без каких-либо комиссий. Срок
                  возврата денежных средств на счет покупателя может составлять
                  до 30 дней в зависимости от банка эмитента.
                </span>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-pickup" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Оплата наличными или картой в пункте самовывоза
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 text-[15px]">
                <div className="flex flex-col gap-3">
                  <span>
                    Оплата при покупке с территории КФХ осуществляется наличными
                    или банковской картой:
                  </span>
                  <ul className="flex flex-col gap-4">
                    <li className="flex gap-3">
                      <span className="text-green-600 font-medium">•</span> В
                      кассу розничного магазина.
                    </li>
                  </ul>
                </div>
                <span>
                  При оплате покупки наличными или банковской картой Вы
                  получаете: чек об оплате, подтверждающий факт покупки.
                </span>
                <span>
                  Информация о товаре и его стоимости актуальна на дату
                  формирования образца чека
                </span>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Условия доставки</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 text-[15px]">
                <span>Доставка по г. Минск: 20 BYN.</span>
                <div className="flex flex-col gap-3">
                  <span>Доставка в другие населенные пункты:</span>
                  <ul className="flex flex-col gap-4">
                    <li className="flex gap-3">
                      <span className="text-green-600 font-medium">•</span>
                      Стоимость доставки в радиусе 60 км от границы города, где
                      расположен КФХ «Сад для Вас» — 20 BYN.
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-medium">•</span>
                      Стоимость доставки в другие, прилегающие к г.Минску
                      населенные пункты, можно уточнить при оформлении заказа.
                    </li>
                  </ul>
                </div>
                <span>
                  Срок доставки зависит от того, где находится товар в и какой
                  населённый пункт его необходимо доставить.
                </span>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="how-to-order" className="mt-0">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl">Как оформить заказ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-[15px]">
                <ul className="flex flex-col gap-4">
                  <li className="flex gap-3">
                    <span className="text-green-600 font-medium">•</span>
                    Заказать товар Вы можете по телефону: +375 (259) 106-65-56.
                    с 8.30 до 18.00 без выходных.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-medium">•</span>
                    Заказы, оформляемые на сайте saddlyavas.by, принимаются
                    круглосуточно. После получения заказа менеджер свяжется с
                    вами и уточнит состав заказа, его стоимость, время и адрес
                    доставки.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-medium">•</span>В
                    розничном магазине доставка оформляется после покупки.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pickup" className="mt-0">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl">Условия самовывоза</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-[15px]">
                <div className="flex flex-col gap-3">
                  <span>Вы можете приобрести товар двумя способами:</span>
                  <ol className="flex flex-col gap-4">
                    <li className="flex gap-3">
                      <span className="text-green-600 font-medium">1</span>
                      Покупка на месте
                      <br />
                      Приезжайте к нам и выбирайте товар прямо на месте. Мы
                      поможем с выбором и ответим на все вопросы.
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-medium">2</span>
                      Самовывоз по заказу
                      <br />
                      Оформите заказ на сайте, и мы заранее подготовим его для
                      вас. После оформления с вами свяжется менеджер для
                      подтверждения и согласования времени выдачи.
                    </li>
                  </ol>
                </div>
                <span>
                  Самовывоз осуществляется с территории КФХ, расположенного по
                  адресу: Республика Беларусь, Минская обл., Минский р-н., 22-ой
                  км трассы Р 23 Минск – Микашевичи или 13 км от Минска,
                  остановка Белица на трассе Р 23
                </span>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
