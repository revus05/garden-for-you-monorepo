import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type AuthPasswordResetEvent = {
  actor_type?: string
  entity_id?: string
  token?: string
  metadata?: {
    reset_url?: string
  }
}

function buildResetUrl(resetUrl: string, token: string) {
  const url = new URL(resetUrl)
  url.searchParams.set("token", token)
  return url.toString()
}

export default async function authPasswordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<AuthPasswordResetEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  if (data?.actor_type !== "customer" || !data.entity_id || !data.token) {
    return
  }

  const resetUrl = data.metadata?.reset_url

  if (!resetUrl) {
    logger.warn("Missing reset_url metadata for auth.password_reset event")
    return
  }

  const url = buildResetUrl(resetUrl, data.token)

  try {
    await notificationModuleService.createNotifications({
      to: data.entity_id,
      channel: "email",
      template: "customer-password-reset",
      trigger_type: "auth.password_reset",
      resource_id: data.entity_id,
      resource_type: "customer",
      data: {
        reset_url: url,
        email: data.entity_id,
      },
      content: {
        subject: "Сброс пароля",
        html: `
          <p>Здравствуйте.</p>
          <p>Чтобы сбросить пароль, перейдите по ссылке ниже:</p>
          <p><a href="${url}">${url}</a></p>
          <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
        `,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown notification error"

    logger.error(`Failed to send password reset email: ${message}`)
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
  context: {
    subscriberId: "auth-password-reset-handler",
  },
}
