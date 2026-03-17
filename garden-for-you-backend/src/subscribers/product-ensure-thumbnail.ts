import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function ensureProductThumbnail({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const productId = data?.id
  if (!productId) return

  const productModuleService: any = container.resolve(Modules.PRODUCT)

  const product = await productModuleService.retrieveProduct(productId, {
    relations: ["images"],
  })

  if (product.thumbnail) return
  const firstImageUrl = product.images?.[0]?.url
  if (!firstImageUrl) return

  await productModuleService.updateProducts(productId, {
    thumbnail: firstImageUrl,
  })
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
}

