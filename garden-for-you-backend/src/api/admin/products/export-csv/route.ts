import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET /admin/products/export-csv
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "title",
      "subtitle",
      "description",
      "status",
      "thumbnail",
      "weight",
      "length",
      "width",
      "height",
      "hs_code",
      "origin_country",
      "material",
      "discountable",
      "collection.title",
      "type.value",
      "tags.value",
      "images.url",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.barcode",
      "variants.allow_backorder",
      "variants.manage_inventory",
      "variants.weight",
      "variants.length",
      "variants.width",
      "variants.height",
      "variants.hs_code",
      "variants.origin_country",
      "variants.material",
      "variants.options.value",
      "variants.options.option.title",
      "variants.prices.amount",
      "variants.prices.currency_code",
      "variants.prices.min_quantity",
      "variants.prices.max_quantity",
    ],
    pagination: { take: 10000 },
  }) as { data: any[] }

  // Collect all unique currency codes to build dynamic price columns
  const currencyCodes = new Set<string>()
  for (const product of products) {
    for (const variant of (product.variants ?? [])) {
      for (const price of (variant.prices ?? [])) {
        if (price.currency_code) currencyCodes.add(price.currency_code.toUpperCase())
      }
    }
  }
  const currencies = Array.from(currencyCodes).sort()

  const headers = [
    "Product ID",
    "Product Handle",
    "Product Title",
    "Product Subtitle",
    "Product Description",
    "Product Status",
    "Product Thumbnail",
    "Product Weight",
    "Product Length",
    "Product Width",
    "Product Height",
    "Product HS Code",
    "Product Origin Country",
    "Product Material",
    "Product Collection",
    "Product Type",
    "Product Tags",
    "Product Discountable",
    "Variant ID",
    "Variant Title",
    "Variant SKU",
    "Variant Barcode",
    "Variant Allow Backorder",
    "Variant Manage Inventory",
    "Variant Weight",
    "Variant Length",
    "Variant Width",
    "Variant Height",
    "Variant HS Code",
    "Variant Origin Country",
    "Variant Material",
    "Option Name",
    "Option Value",
    "Image URL",
    ...currencies.map((c) => `Price ${c}`),
  ]

  const rows: string[][] = [headers]

  for (const product of products) {
    const tags = (product.tags ?? []).map((t: any) => t.value).join(", ")
    const collectionTitle = (product as any).collection?.title ?? ""
    const typeValue = (product as any).type?.value ?? ""
    const images = (product.images ?? []).map((i: any) => i.url).join(", ")
    const variants = product.variants ?? []

    const productBase = [
      product.id,
      product.handle ?? "",
      product.title ?? "",
      product.subtitle ?? "",
      product.description ?? "",
      product.status ?? "",
      product.thumbnail ?? "",
      String(product.weight ?? ""),
      String((product as any).length ?? ""),
      String((product as any).width ?? ""),
      String((product as any).height ?? ""),
      (product as any).hs_code ?? "",
      (product as any).origin_country ?? "",
      (product as any).material ?? "",
      collectionTitle,
      typeValue,
      tags,
      String((product as any).discountable ?? ""),
    ]

    if (variants.length === 0) {
      rows.push([
        ...productBase,
        "", "", "", "", "", "", "", "", "", "", "", "", "", images,
        ...currencies.map(() => ""),
      ])
      continue
    }

    for (const variant of variants) {
      const variantOptionNames = (variant.options ?? [])
        .map((o: any) => o.option?.title ?? "")
        .join(", ")
      const variantOptionValues = (variant.options ?? [])
        .map((o: any) => o.value ?? "")
        .join(", ")

      // Build price map: currency -> formatted amount (stored in minor units)
      const priceMap: Record<string, string> = {}
      for (const price of (variant.prices ?? [])) {
        const code = price.currency_code?.toUpperCase()
        if (!code) continue
        priceMap[code] = price.amount.toFixed(2)
      }

      rows.push([
        ...productBase,
        variant.id,
        variant.title ?? "",
        variant.sku ?? "",
        variant.barcode ?? "",
        String(variant.allow_backorder ?? ""),
        String(variant.manage_inventory ?? ""),
        String(variant.weight ?? ""),
        String((variant as any).length ?? ""),
        String((variant as any).width ?? ""),
        String((variant as any).height ?? ""),
        (variant as any).hs_code ?? "",
        (variant as any).origin_country ?? "",
        (variant as any).material ?? "",
        variantOptionNames,
        variantOptionValues,
        images,
        ...currencies.map((c) => priceMap[c] ?? ""),
      ])
    }
  }

  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? "").replace(/"/g, '""')
          return /[,"\n\r]/.test(str) ? `"${str}"` : str
        })
        .join(",")
    )
    .join("\r\n")

  res.status(200).json({ csv: "\uFEFF" + csv })
}
