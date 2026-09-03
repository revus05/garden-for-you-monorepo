import type { Logger } from "@medusajs/framework/types"

const API_URL = "https://app.sms.by/api/v1"

export type SendCodeResult = {
  ok: boolean
}

type SmsByResponse = {
  error?: unknown
  message?: unknown
  sms_id?: unknown
}

// Delivers a verification code through the sms.by gateway.
// Docs: https://sms.by/api/
export async function sendVerificationCode(
  phone: string,
  code: string,
  logger: Logger,
): Promise<SendCodeResult> {
  const token = process.env.SMSBY_TOKEN

  if (!token) {
    logger.warn("SMSBY_TOKEN is not set, cannot send verification code")
    return { ok: false }
  }

  // sms.by expects the number in international format without the leading "+".
  const recipient = phone.replace(/\D/g, "")

  const params = new URLSearchParams({
    token,
    message: `Ваш код подтверждения: ${code}`,
    phone: recipient,
  })

  const alphanameId = process.env.SMSBY_ALPHANAME_ID
  if (alphanameId) {
    params.set("alphaname_id", alphanameId)
  }

  try {
    const res = await fetch(`${API_URL}/sendQuickSMS?${params.toString()}`, {
      method: "POST",
    })
    const data = (await res.json()) as SmsByResponse

    if (!res.ok || data.error) {
      logger.warn(`sms.by send failed: ${JSON.stringify(data)}`)
      return { ok: false }
    }

    logger.info(`Verification code sent via sms.by to ${phone}`)
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error"
    logger.error(`sms.by request failed: ${message}`)
    return { ok: false }
  }
}
