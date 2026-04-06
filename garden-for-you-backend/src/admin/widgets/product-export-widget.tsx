import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, toast } from "@medusajs/ui"
import { useState } from "react"
import { sdk } from "../lib/sdk"

const ProductExportWidget = () => {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const { csv } = await sdk.client.fetch<{ csv: string }>(
        "/admin/products/export-csv",
        { method: "GET" }
      )

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `products-export-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("CSV успешно скачан")
    } catch (e: any) {
      toast.error(`Не удалось экспортировать: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-ui-fg-base font-medium text-sm">Экспорт товаров</p>
        <p className="text-ui-fg-muted text-xs mt-0.5">
          Скачать все товары в формате CSV (без загрузки в облако)
        </p>
      </div>
      <Button
        size="small"
        variant="secondary"
        isLoading={loading}
        onClick={handleExport}
      >
        Скачать CSV
      </Button>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default ProductExportWidget
