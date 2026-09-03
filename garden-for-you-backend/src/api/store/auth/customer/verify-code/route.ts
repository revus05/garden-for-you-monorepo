import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { ICacheService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { randomUUID } from "node:crypto"
import { normalizeByPhone } from "../../../../../lib/phone"

type VerifyCodeBody = {
  phone?: string
  code?: string
}

type CodeEntry = {
  code: string
  attempts: number
}

const MAX_ATTEMPTS = 5
const TOKEN_TTL_SECONDS = 1200 // 20 minutes

function codeKey(phone: string) {
  return `otp:reg:code:${phone}`
}

function tokenKey(token: string) {
  return `otp:reg:token:${token}`
}

export async function POST(
  req: MedusaRequest<VerifyCodeBody>,
  res: MedusaResponse,
) {
  const phone = normalizeByPhone(req.body?.phone ?? "")
  const code = typeof req.body?.code === "string" ? req.body.code.trim() : ""

  if (!phone || !code) {
    res.status(400).json({ message: "Некорректные данные." })
    return
  }

  const cache = req.scope.resolve<ICacheService>(Modules.CACHE)
  const entry = await cache.get<CodeEntry>(codeKey(phone))

  if (!entry) {
    res
      .status(400)
      .json({ message: "Код истёк или не был запрошен. Запросите новый." })
    return
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    await cache.invalidate(codeKey(phone))
    res
      .status(429)
      .json({ message: "Слишком много попыток. Запросите новый код." })
    return
  }

  if (entry.code !== code) {
    await cache.set(
      codeKey(phone),
      { code: entry.code, attempts: entry.attempts + 1 },
      300,
    )
    res.status(400).json({ message: "Неверный код." })
    return
  }

  await cache.invalidate(codeKey(phone))

  const token = randomUUID()
  await cache.set(tokenKey(token), phone, TOKEN_TTL_SECONDS)

  res.status(200).json({ verification_token: token })
}
