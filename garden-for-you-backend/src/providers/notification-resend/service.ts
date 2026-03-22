import type { Logger, NotificationTypes } from "@medusajs/framework/types"
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"

type ResendNotificationServiceOptions = {
  api_key?: string
  from?: string
}

type InjectedDependencies = {
  logger: Logger
}

type ResendEmailPayload = {
  from: string
  to: string[]
  subject?: string
  html?: string
  text?: string
  attachments?: {
    filename: string
    content: string
    content_type?: string
  }[]
}

export class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "notification-resend"

  protected config_: {
    apiKey: string
    from: string
  }

  protected logger_: Logger

  constructor(
    { logger }: InjectedDependencies,
    options: ResendNotificationServiceOptions
  ) {
    super()

    if (!options.api_key || !options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "RESEND_API_KEY and RESEND_FROM are required to use the Resend notification provider."
      )
    }

    this.config_ = {
      apiKey: options.api_key,
      from: options.from,
    }
    this.logger_ = logger
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No notification information provided"
      )
    }

    const payload: ResendEmailPayload = {
      from: notification.from?.trim() || this.config_.from,
      to: [notification.to],
    }

    if ("content" in notification && notification.content) {
      payload.subject = notification.content.subject
      payload.html = notification.content.html
      payload.text = notification.content.text
    } else {
      payload.subject = String(notification.data?.subject ?? "Notification")
      payload.html =
        typeof notification.data?.html === "string"
          ? notification.data.html
          : undefined
      payload.text =
        typeof notification.data?.text === "string"
          ? notification.data.text
          : undefined
    }

    if (!payload.html && !payload.text) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend provider requires html or text content."
      )
    }

    if (Array.isArray(notification.attachments)) {
      payload.attachments = notification.attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        content_type: attachment.content_type,
      }))
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config_.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as
        | { message?: string; name?: string }
        | null

      this.logger_.error(
        `Failed to send email with Resend: ${response.status} ${errorBody?.message ?? "unknown error"}`
      )

      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send email: ${response.status} - ${errorBody?.message ?? "unknown error"}`
      )
    }

    return {}
  }
}

export default ResendNotificationService
