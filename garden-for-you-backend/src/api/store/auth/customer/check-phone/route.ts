import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const BY_MOBILE_CODES = ["29", "33", "44", "25"]

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  let national: string | null = null

  if (digits.length === 12 && digits.startsWith("375")) {
    national = digits.slice(3)
  } else if (digits.length === 11 && digits.startsWith("80")) {
    national = digits.slice(2)
  } else if (digits.length === 9) {
    national = digits
  }

  if (national && BY_MOBILE_CODES.includes(national.slice(0, 2))) {
    return `+375${national}`
  }

  return null
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const raw = typeof req.query.phone === "string" ? req.query.phone : ""
  const phone = normalizePhone(raw)

  if (!phone) {
    res.status(400).json({ message: "Некорректный номер телефона." })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "customer",
    fields: ["id"],
    filters: { phone },
  })

  res.status(200).json({ exists: data.length > 0 })
}
