import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { ICacheService, Logger } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { randomInt } from "node:crypto"
import { normalizeByPhone } from "../../../../../lib/phone"
import { sendVerificationCode } from "../../../../../lib/sms-gateway"

type SendCodeBody = {
  phone?: string
}

const CODE_TTL_SECONDS = 300 // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60

function codeKey(phone: string) {
  return `otp:reg:code:${phone}`
}

function cooldownKey(phone: string) {
  return `otp:reg:cooldown:${phone}`
}

export async function POST(
  req: MedusaRequest<SendCodeBody>,
  res: MedusaResponse,
) {
  const phone = normalizeByPhone(req.body?.phone ?? "")

  if (!phone) {
    res.status(400).json({ message: "Некорректный номер телефона." })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const cache = req.scope.resolve<ICacheService>(Modules.CACHE)
  const logger = req.scope.resolve<Logger>(ContainerRegistrationKeys.LOGGER)

  const { data: existing } = await query.graph({
    entity: "customer",
    fields: ["id"],
    filters: { phone },
  })

  if (existing.length > 0) {
    res.status(409).json({ message: "Этот номер телефона уже зарегистрирован." })
    return
  }

  const onCooldown = await cache.get<string>(cooldownKey(phone))
  if (onCooldown) {
    res
      .status(429)
      .json({ message: "Код уже отправлен. Попробуйте позже." })
    return
  }

  const code = String(randomInt(100000, 1000000))

  await cache.set(codeKey(phone), { code, attempts: 0 }, CODE_TTL_SECONDS)
  await cache.set(cooldownKey(phone), "1", RESEND_COOLDOWN_SECONDS)

  const result = await sendVerificationCode(phone, code, logger)

  if (!result.ok) {
    await cache.invalidate(cooldownKey(phone))
    res
      .status(502)
      .json({ message: "Не удалось отправить код. Попробуйте позже." })
    return
  }

  res.status(200).json({ sent: true })
}
