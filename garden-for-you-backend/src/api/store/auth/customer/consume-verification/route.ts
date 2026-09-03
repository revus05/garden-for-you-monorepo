import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { ICacheService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { normalizeByPhone } from "../../../../../lib/phone"

type ConsumeBody = {
  phone?: string
  token?: string
}

function tokenKey(token: string) {
  return `otp:reg:token:${token}`
}

// Validates and consumes a one-time verification token issued by verify-code.
// Called server-side by the storefront right before creating the account so
// that registration cannot proceed without a verified phone number.
export async function POST(
  req: MedusaRequest<ConsumeBody>,
  res: MedusaResponse,
) {
  const phone = normalizeByPhone(req.body?.phone ?? "")
  const token = typeof req.body?.token === "string" ? req.body.token : ""

  if (!phone || !token) {
    res.status(400).json({ ok: false })
    return
  }

  const cache = req.scope.resolve<ICacheService>(Modules.CACHE)
  const storedPhone = await cache.get<string>(tokenKey(token))

  if (!storedPhone || storedPhone !== phone) {
    res.status(400).json({ ok: false })
    return
  }

  await cache.invalidate(tokenKey(token))
  res.status(200).json({ ok: true })
}
