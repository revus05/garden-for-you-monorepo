import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Input, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/sdk"

type VariantInventory = {
  id: string
  title: string
  sku: string | null
  inventory_item_id: string | null
  stocked_quantity: number
  reserved_quantity: number
  location_id: string | null
}

/**
 * Widget: product-inventory-widget
 *
 * Displayed on the product details page (side panel).
 * Shows each variant's stock level with inline editing —
 * no need to navigate to a separate inventory screen.
 */
const ProductInventoryWidget = ({ data }: { data: { id: string } }) => {
  const productId = data.id
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>("")

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ["admin", "inventory", "product", productId],
    queryFn: async () => {
      const res = await sdk.client.fetch<{ variants: VariantInventory[] }>(
        `/admin/inventory?product_id=${productId}`,
        { method: "GET" }
      )
      return res.variants
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: string; quantity: number }) => {
      await sdk.client.fetch(`/admin/inventory/${variantId}`, {
        method: "PUT",
        body: { stocked_quantity: quantity },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "inventory", "product", productId] })
      toast.success("Остаток обновлён")
      setEditingId(null)
      setEditValue("")
    },
    onError: () => toast.error("Не удалось обновить остаток"),
  })

  const handleStartEdit = (variant: VariantInventory) => {
    setEditingId(variant.id)
    setEditValue(String(variant.stocked_quantity))
  }

  const handleSave = (variantId: string) => {
    const qty = parseInt(editValue, 10)
    if (isNaN(qty) || qty < 0) {
      toast.error("Введите целое неотрицательное число")
      return
    }
    updateMutation.mutate({ variantId, quantity: qty })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue("")
  }

  if (isLoading) {
    return (
      <Container className="px-6 py-4">
        <Text className="text-ui-fg-muted text-sm">Загрузка остатков…</Text>
      </Container>
    )
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <Heading level="h2">Остатки на складе</Heading>
      </div>

      {variants.length === 0 ? (
        <div className="px-6 py-4">
          <Text className="text-ui-fg-muted text-sm">Нет вариантов для отображения</Text>
        </div>
      ) : (
        <div className="divide-y divide-ui-border-base">
          {variants.map((variant) => {
            const isEditing = editingId === variant.id
            const available = variant.stocked_quantity - variant.reserved_quantity

            return (
              <div
                key={variant.id}
                className="flex items-center justify-between gap-4 px-6 py-3"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Text size="small" weight="plus" className="truncate">
                    {variant.title}
                  </Text>
                  {variant.sku && (
                    <Text size="xsmall" className="text-ui-fg-muted font-mono">
                      {variant.sku}
                    </Text>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!isEditing ? (
                    <>
                      <Badge size="2xsmall" color={available > 0 ? "green" : "red"}>
                        {available > 0 ? `${available} дост.` : "нет"}
                      </Badge>
                      <Button
                        size="small"
                        variant="secondary"
                        title="Нажмите для изменения"
                        onClick={() => handleStartEdit(variant)}
                      >
                        {variant.stocked_quantity}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        className="h-8 w-20"
                        type="number"
                        min={0}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave(variant.id)
                          if (e.key === "Escape") handleCancel()
                        }}
                        autoFocus
                      />
                      <Button
                        size="small"
                        isLoading={updateMutation.isPending}
                        onClick={() => handleSave(variant.id)}
                      >
                        ОК
                      </Button>
                      <Button size="small" variant="secondary" onClick={handleCancel}>
                        ✕
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default ProductInventoryWidget
