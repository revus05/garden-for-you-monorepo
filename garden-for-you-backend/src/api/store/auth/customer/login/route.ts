import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { ConfigModule, IAuthModuleService } from "@medusajs/types"
import {
  ContainerRegistrationKeys,
  Modules,
  generateJwtToken,
} from "@medusajs/framework/utils"

type LoginBody = {
  identifier?: string
  password?: string
}

const BY_MOBILE_CODES = ["29", "33", "44", "25"]

// Determines whether the identifier is an email or a Belarusian phone number.
// Emails are passed through as typed (to match the entity_id used at register),
// phones are normalized to the +375XXXXXXXXX form stored on the customer.
function resolveIdentifier(raw: string): { email?: string; phone?: string } {
  const value = raw.trim()

  if (value.includes("@")) {
    return { email: value }
  }

  const digits = value.replace(/\D/g, "")
  let national: string | null = null

  if (digits.length === 12 && digits.startsWith("375")) {
    national = digits.slice(3)
  } else if (digits.length === 11 && digits.startsWith("80")) {
    national = digits.slice(2)
  } else if (digits.length === 9) {
    national = digits
  }

  if (national && BY_MOBILE_CODES.includes(national.slice(0, 2))) {
    return { phone: `+375${national}` }
  }

  return {}
}

export async function POST(
  req: MedusaRequest<LoginBody>,
  res: MedusaResponse
) {
  const { identifier, password } = req.body ?? {}

  if (
    typeof identifier !== "string" ||
    typeof password !== "string" ||
    !identifier.trim() ||
    !password
  ) {
    res.status(400).json({ message: "Некорректные данные." })
    return
  }

  const parsed = resolveIdentifier(identifier)
  let email = parsed.email

  if (!email && parsed.phone) {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "customer",
      fields: ["email"],
      filters: { phone: parsed.phone },
    })
    email = data[0]?.email ?? undefined
  }

  // Same error for "no such user" and "wrong password" to avoid enumeration.
  if (!email) {
    res.status(401).json({ message: "Неверный email/телефон или пароль." })
    return
  }

  const authModuleService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)
  const { success, authIdentity } = await authModuleService.authenticate(
    "emailpass",
    {
      url: req.url,
      headers: req.headers as Record<string, string>,
      query: req.query as Record<string, string>,
      body: { email, password },
      protocol: req.protocol,
    }
  )

  if (!success || !authIdentity) {
    res.status(401).json({ message: "Неверный email/телефон или пароль." })
    return
  }

  const config = req.scope.resolve<ConfigModule>(
    ContainerRegistrationKeys.CONFIG_MODULE
  )
  const { http } = config.projectConfig

  const entityId = (
    authIdentity.app_metadata as Record<string, unknown> | undefined
  )?.customer_id
  const providerIdentity = authIdentity.provider_identities?.find(
    (pi) => pi.provider === "emailpass"
  )

  const token = generateJwtToken(
    {
      actor_id: entityId ?? "",
      actor_type: "customer",
      auth_identity_id: authIdentity.id ?? "",
      app_metadata: { customer_id: entityId, roles: [] },
      user_metadata: providerIdentity?.user_metadata ?? {},
    },
    {
      secret: http.jwtSecret,
      expiresIn: http.jwtExpiresIn,
      jwtOptions: http.jwtOptions,
    }
  )

  res.status(200).json({ token })
}
