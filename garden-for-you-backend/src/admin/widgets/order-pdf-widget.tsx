import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container } from "@medusajs/ui"

type OrderAddress = {
  first_name?: string
  last_name?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  phone?: string
  company?: string
}

type OrderItem = {
  id: string
  title: string
  subtitle?: string
  quantity: number
  unit_price: number
  total: number
  thumbnail?: string
  variant?: { sku?: string }
}

type ShippingMethod = {
  id: string
  name?: string
  total?: number
  amount?: number
  shipping_option?: { name?: string }
}

type PaymentCollection = {
  id: string
  status?: string
  amount?: number
  payments?: { provider_id?: string; amount?: number; status?: string }[]
  payment_sessions?: { provider_id?: string; amount?: number; status?: string }[]
}

type Order = {
  id: string
  display_id: number
  status: string
  payment_status?: string
  fulfillment_status?: string
  currency_code: string
  email?: string
  created_at: string
  subtotal: number
  tax_total?: number
  shipping_total?: number
  discount_total?: number
  total: number
  items?: OrderItem[]
  shipping_address?: OrderAddress
  billing_address?: OrderAddress
  shipping_methods?: ShippingMethod[]
  payment_collections?: PaymentCollection[]
  customer?: { email?: string; first_name?: string; last_name?: string; phone?: string }
}

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount)

const fmtDate = (d: string) => {
  const dt = new Date(d)
  const date = dt.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
  const time = dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  return `${date} ${time}`
}

const fmtAddress = (addr?: OrderAddress): string => {
  if (!addr) return "—"
  const name = [addr.company, [addr.first_name, addr.last_name].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ")
  const street = [addr.address_1, addr.address_2].filter(Boolean).join(", ")
  const city = [addr.postal_code, addr.city, addr.province].filter(Boolean).join(" ")
  const country = addr.country_code?.toUpperCase()
  return [name, street, city, country].filter(Boolean).join("\n")
}

const ORDER_STATUS: Record<string, string> = {
  pending: "Ожидает",
  completed: "Завершён",
  cancelled: "Отменён",
  requires_action: "Требует действия",
  archived: "Архивирован",
}

const PAYMENT_STATUS: Record<string, string> = {
  not_paid: "Не оплачен",
  awaiting: "Ожидает оплаты",
  captured: "Оплачен",
  partially_captured: "Частично оплачен",
  refunded: "Возвращён",
  partially_refunded: "Частично возвращён",
  canceled: "Отменён",
}

const FULFILLMENT_STATUS: Record<string, string> = {
  not_fulfilled: "Не обработан",
  fulfilled: "Обработан",
  partially_fulfilled: "Частично обработан",
  shipped: "Отправлен",
  partially_shipped: "Частично отправлен",
  returned: "Возвращён",
  partially_returned: "Частично возвращён",
  canceled: "Отменён",
}

const PROVIDER_LABELS: Record<string, string> = {
  pp_system_default: "Системный",
  pp_stripe_stripe: "Stripe",
  manual: "Вручную",
  cash_on_delivery: "Наличными при получении",
}

const label = (map: Record<string, string>, key?: string) =>
  (key && map[key]) || key || "—"

function generateHTML(order: Order): string {
  const cur = order.currency_code
  const items = order.items ?? []
  const shippingMethods = order.shipping_methods ?? []
  const paymentCollections = order.payment_collections ?? []

  const customerName =
    [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(" ") || "—"
  const customerEmail = order.email || order.customer?.email || "—"
  const customerPhone = order.customer?.phone || order.shipping_address?.phone || "—"

  const shippingAddrLines = fmtAddress(order.shipping_address)
    .split("\n")
    .map((l) => `<div>${l}</div>`)
    .join("")

  const billingAddrLines = fmtAddress(order.billing_address)
    .split("\n")
    .map((l) => `<div>${l}</div>`)
    .join("")

  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td>
        <div class="item-title">${item.title}</div>
        ${item.subtitle ? `<div class="item-sub">${item.subtitle}</div>` : ""}
        ${item.variant?.sku ? `<div class="item-sub">SKU: ${item.variant.sku}</div>` : ""}
      </td>
      <td class="center">${item.quantity}</td>
      <td class="right">${fmt(item.unit_price, cur)}</td>
      <td class="right">${fmt(item.total, cur)}</td>
    </tr>`
    )
    .join("")

  const shippingHTML =
    shippingMethods.length > 0
      ? shippingMethods
          .map((m) => {
            const name = m.shipping_option?.name || m.name || "Доставка"
            const amount = m.total ?? m.amount
            return `<div>${name}${amount != null ? ` — ${fmt(amount, cur)}` : ""}</div>`
          })
          .join("")
      : "<div>—</div>"

  const paymentHTML =
    paymentCollections.length > 0
      ? paymentCollections
          .map((pc) => {
            const payments = pc.payments ?? pc.payment_sessions ?? []
            const rows = payments
              .map(
                (p) =>
                  `<div>Провайдер: ${label(PROVIDER_LABELS, p.provider_id)}${
                    p.amount != null ? ` — ${fmt(p.amount, cur)}` : ""
                  }${p.status ? ` (${label(PAYMENT_STATUS, p.status)})` : ""}</div>`
              )
              .join("")
            return `<div>Статус: <strong>${label(PAYMENT_STATUS, pc.status)}</strong></div>${
              pc.amount != null ? `<div>Сумма: ${fmt(pc.amount, cur)}</div>` : ""
            }${rows}`
          })
          .join('<div class="divider"></div>')
      : "<div>—</div>"

  const discountRow =
    order.discount_total && order.discount_total > 0
      ? `<tr><td>Скидка:</td><td class="right">–${fmt(order.discount_total, cur)}</td></tr>`
      : ""

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Заказ №${order.display_id}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      color: #111;
      padding: 32px 40px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111;
      padding-bottom: 14px;
      margin-bottom: 24px;
    }
    .header h1 { font-size: 22px; }
    .header .meta { font-size: 12px; color: #555; margin-top: 4px; }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      background: #eee;
      color: #333;
      font-weight: 600;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .section { }
    .section h2 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #666;
      border-bottom: 1px solid #ddd;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .section p, .section div { font-size: 13px; color: #222; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    thead th {
      background: #f4f4f4;
      padding: 8px 10px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      border-top: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
    }
    tbody td {
      padding: 8px 10px;
      border-bottom: 1px solid #eee;
      vertical-align: top;
    }
    .item-title { font-weight: 600; }
    .item-sub { font-size: 11px; color: #777; margin-top: 2px; }
    .center { text-align: center; }
    .right { text-align: right; white-space: nowrap; }
    .totals-table { margin-left: auto; margin-top: 12px; width: auto; }
    .totals-table td { padding: 4px 10px; border: none; font-size: 13px; }
    .totals-table .total-final td {
      font-weight: 700;
      font-size: 14px;
      border-top: 2px solid #111;
      padding-top: 8px;
    }
    .divider { border-top: 1px solid #eee; margin: 8px 0; }
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      font-size: 11px;
      color: #999;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1>Заказ №${order.display_id}</h1>
      <div class="meta">Дата: ${fmtDate(order.created_at)}</div>
      <div class="meta" style="margin-top:6px">
        Статус заказа: <span class="badge">${label(ORDER_STATUS, order.status)}</span>
        ${order.payment_status ? `&nbsp; Оплата: <span class="badge">${label(PAYMENT_STATUS, order.payment_status)}</span>` : ""}
        ${order.fulfillment_status ? `&nbsp; Доставка: <span class="badge">${label(FULFILLMENT_STATUS, order.fulfillment_status)}</span>` : ""}
      </div>
    </div>
    <div style="text-align:right;font-size:12px;color:#555">
      <div>ID: ${order.id}</div>
    </div>
  </div>

  <div class="grid">
    <div class="section">
      <h2>Покупатель</h2>
      <div>${customerName}</div>
      <div>${customerEmail}</div>
      ${customerPhone !== "—" ? `<div>Тел: ${customerPhone}</div>` : ""}
    </div>
    <div class="section">
      <h2>Адрес доставки</h2>
      ${shippingAddrLines || "<div>—</div>"}
      ${order.shipping_address?.phone ? `<div>Тел: ${order.shipping_address.phone}</div>` : ""}
    </div>
  </div>

  ${
    order.billing_address && order.billing_address.address_1
      ? `<div class="grid">
    <div class="section">
      <h2>Адрес выставления счёта</h2>
      ${billingAddrLines}
    </div>
    <div></div>
  </div>`
      : ""
  }

  <div class="grid">
    <div class="section">
      <h2>Способ доставки</h2>
      ${shippingHTML}
    </div>
    <div class="section">
      <h2>Оплата</h2>
      ${paymentHTML}
    </div>
  </div>

  <div class="section" style="margin-bottom:24px">
    <h2>Товары (${items.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Наименование</th>
          <th class="center">Кол-во</th>
          <th class="right">Цена за ед.</th>
          <th class="right">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML || '<tr><td colspan="4" style="color:#999;padding:12px 10px">Нет товаров</td></tr>'}
      </tbody>
    </table>
    <table class="totals-table">
      <tbody>
        <tr>
          <td>Подытог:</td>
          <td class="right">${fmt(order.subtotal, cur)}</td>
        </tr>
        ${discountRow}
        <tr>
          <td>Доставка:</td>
          <td class="right">${fmt(order.shipping_total ?? 0, cur)}</td>
        </tr>
        <tr>
          <td>Налоги:</td>
          <td class="right">${fmt(order.tax_total ?? 0, cur)}</td>
        </tr>
        <tr class="total-final">
          <td>Итого:</td>
          <td class="right">${fmt(order.total, cur)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    Документ сформирован ${new Date().toLocaleString("ru-RU")} &nbsp;·&nbsp; Заказ №${order.display_id}
  </div>

</body>
</html>`
}

const OrderPdfWidget = ({ data }: { data: Order }) => {
  const handlePrint = () => {
    const win = window.open("", "_blank", "width=960,height=720")
    if (!win) {
      alert("Пожалуйста, разрешите открытие всплывающих окон для этого сайта.")
      return
    }
    win.document.open()
    win.document.write(generateHTML(data))
    win.document.close()
    win.onload = () => {
      win.focus()
      win.print()
    }
  }

  return (
    <Container className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-ui-fg-base font-medium text-sm">Документ заказа</p>
        <p className="text-ui-fg-muted text-xs mt-0.5">
          Сохранить заказ №{data.display_id} в PDF с полной информацией
        </p>
      </div>
      <Button size="small" variant="secondary" onClick={handlePrint}>
        Скачать PDF
      </Button>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderPdfWidget
