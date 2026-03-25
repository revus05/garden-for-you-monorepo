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
import { withHomeLayout } from "@/widgets/layouts/home";

const PaymentAndShippingPage = () => {
  return (
    <div className="wrapper py-12">
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
          defaultValue="payment"
          className="w-full grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8"
          orientation="vertical"
        >
          {/* Вертикальное меню слева */}
          <TabsList className="flex flex-col w-full h-auto bg-muted/50 p-1 rounded-xl sticky top-6">
            <TabsTrigger
              value="payment"
              className="justify-start text-left py-3.5 px-5 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              Способы оплаты
            </TabsTrigger>
            <TabsTrigger
              value="minsk"
              className="justify-start text-left py-3.5 px-5 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              Доставка по Минску
            </TabsTrigger>
            <TabsTrigger
              value="belarus"
              className="justify-start text-left py-3.5 px-5 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              Доставка по Беларуси
            </TabsTrigger>
            <TabsTrigger
              value="pickup"
              className="justify-start text-left py-3.5 px-5 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              Самовывоз
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="justify-start text-left py-3.5 px-5 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              Дополнительные услуги
            </TabsTrigger>
          </TabsList>

          <div>
            <TabsContent value="payment" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Способы оплаты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-[15px]">
                  <div>
                    <h3 className="font-semibold mb-3">Доступные варианты:</h3>
                    <ul className="grid gap-3">
                      <li className="flex gap-3">
                        <span className="text-green-600 font-medium mt-0.5">
                          •
                        </span>
                        <span>
                          Банковской картой онлайн (Visa, Mastercard, Белкарт,
                          Мир) на сайте
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-green-600 font-medium mt-0.5">
                          •
                        </span>
                        <span>
                          Наличными или картой при получении (курьер /
                          самовывоз)
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-green-600 font-medium mt-0.5">
                          •
                        </span>
                        <span>
                          Рассрочка 0-0-12 / 0-0-24 без переплат (Карта покупок,
                          Халва, Магнит и др.)
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-green-600 font-medium mt-0.5">
                          •
                        </span>
                        <span>Оплата через систему ЕРИП</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-green-600 font-medium mt-0.5">
                          •
                        </span>
                        <span>
                          Безналичный расчёт для юридических лиц (счёт на email)
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-green-600 font-medium mt-0.5">
                          •
                        </span>
                        <span>QR-платёж (сервис «КРОК»)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/60 p-5 rounded-xl text-sm">
                    Все онлайн-платежи проходят через защищённый протокол.
                    Данные карты не сохраняются на сайте.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="minsk" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Доставка по Минску и пригородам
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-[15px]">
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <span className="text-green-600 font-medium mt-1">•</span>{" "}
                      <strong>Бесплатно</strong> при заказе от 100 BYN
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-medium mt-1">•</span>{" "}
                      На следующий день или в удобный интервал
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-medium mt-1">•</span>{" "}
                      Подъём на этаж — платная услуга
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="belarus" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Доставка по всей Беларуси
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-[15px]">
                  <p>Стоимость: от 15 до 35 BYN (рассчитывается в корзине)</p>
                  <p>Срок: 1–5 рабочих дней</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pickup" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Самовывоз</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-[15px]">
                  <p>
                    Забрать заказ можно в любом магазине «5 элемент» по всей
                    Беларуси.
                  </p>
                  <p className="font-medium">
                    Готовность: от 30 минут до 3 часов
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="mt-0">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Дополнительные услуги
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-[15px]">
                  <ul className="space-y-3">
                    <li>• Подъём товара на этаж</li>
                    <li>• Вывоз старой техники</li>
                    <li>• Установка и подключение</li>
                    <li>• Настройка техники</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default withHomeLayout(PaymentAndShippingPage);
