import { Buildings } from "@medusajs/icons"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Input, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../lib/sdk"

export const config = defineRouteConfig({
  label: "Склад",
  icon: Buildings,
  rank: 44,
})

type VariantInventory = {
  id: string
  title: string
  sku: string | null
  product_id: string
  product_title: string | null
  product_thumbnail: string | null
  inventory_item_id: string | null
  stocked_quantity: number
  reserved_quantity: number
  location_id: string | null
}

type ProductGroup = {
  title: string
  thumbnail: string | null
  variants: VariantInventory[]
}

const InventoryManagementPage = () => {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [search, setSearch] = useState("")

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: async () => {
      const res = await sdk.client.fetch<{ variants: VariantInventory[] }>(
        "/admin/inventory",
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
      await queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] })
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

  // Filter variants by search query
  const searchLower = search.trim().toLowerCase()
  const filtered = searchLower
    ? variants.filter(
        (v) =>
          v.product_title?.toLowerCase().includes(searchLower) ||
          v.title.toLowerCase().includes(searchLower) ||
          v.sku?.toLowerCase().includes(searchLower)
      )
    : variants

  // Group filtered variants by product
  const productGroups = filtered.reduce<Record<string, ProductGroup>>((acc, v) => {
    if (!acc[v.product_id]) {
      acc[v.product_id] = { title: v.product_title ?? v.product_id, thumbnail: v.product_thumbnail, variants: [] }
    }
    acc[v.product_id].variants.push(v)
    return acc
  }, {})

  const totalStocked = variants.reduce((sum, v) => sum + v.stocked_quantity, 0)
  const totalReserved = variants.reduce((sum, v) => sum + v.reserved_quantity, 0)
  const outOfStock = variants.filter((v) => v.stocked_quantity - v.reserved_quantity <= 0).length

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <Container className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Heading level="h1">Управление складом</Heading>
            <Text size="small" className="text-ui-fg-muted mt-1">
              Остатки по вариантам. Нажмите на число, чтобы изменить количество.
            </Text>
          </div>
          <Input
            placeholder="Поиск по товару, варианту или SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72"
          />
        </div>
      </Container>

      {/* Summary stats */}
      {!isLoading && variants.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Container className="px-6 py-4">
            <Text size="small" className="text-ui-fg-muted">Всего на складе</Text>
            <Text size="xlarge" weight="plus">{totalStocked.toLocaleString("ru-RU")}</Text>
          </Container>
          <Container className="px-6 py-4">
            <Text size="small" className="text-ui-fg-muted">Зарезервировано</Text>
            <Text size="xlarge" weight="plus">{totalReserved.toLocaleString("ru-RU")}</Text>
          </Container>
          <Container className="px-6 py-4">
            <Text size="small" className="text-ui-fg-muted">Вариантов нет в наличии</Text>
            <Text size="xlarge" weight="plus" className={outOfStock > 0 ? "text-ui-fg-error" : ""}>
              {outOfStock}
            </Text>
          </Container>
        </div>
      )}

      {/* Product groups */}
      {isLoading ? (
        <Container className="px-6 py-10 text-center">
          <Text className="text-ui-fg-muted">Загрузка…</Text>
        </Container>
      ) : Object.keys(productGroups).length === 0 ? (
        <Container className="px-6 py-10 text-center">
          <Text className="text-ui-fg-muted">
            {search ? "По запросу ничего не найдено" : "Нет товаров с вариантами"}
          </Text>
        </Container>
      ) : (
        Object.entries(productGroups).map(([productId, group]) => (
          <Container key={productId} className="p-0">
            {/* Product header */}
            <div className="flex items-center gap-3 border-b border-ui-border-base px-6 py-4">
              {group.thumbnail && (
                <img
                  src={group.thumbnail}
                  alt={group.title}
                  className="h-9 w-9 rounded object-cover shrink-0"
                />
              )}
              <Heading level="h2" className="truncate">
                {group.title}
              </Heading>
              <Badge size="2xsmall" color="grey">
                {group.variants.length} вар.
              </Badge>
            </div>

            {/* Variants table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ui-border-base text-left text-ui-fg-muted">
                  <th className="px-6 py-3 font-medium">Вариант</th>
                  <th className="px-6 py-3 font-medium">SKU</th>
                  <th className="px-6 py-3 font-medium">На складе</th>
                  <th className="px-6 py-3 font-medium">Зарезервировано</th>
                  <th className="px-6 py-3 font-medium">Доступно</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-base">
                {group.variants.map((variant) => {
                  const isEditing = editingId === variant.id
                  const available = variant.stocked_quantity - variant.reserved_quantity

                  return (
                    <tr key={variant.id} className="hover:bg-ui-bg-subtle-hover">
                      <td className="px-6 py-3 font-medium">{variant.title}</td>
                      <td className="px-6 py-3 font-mono text-xs text-ui-fg-muted">
                        {variant.sku ?? "—"}
                      </td>
                      <td className="px-6 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              className="h-8 w-24"
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
                          </div>
                        ) : (
                          <button
                            className="font-mono hover:text-ui-fg-interactive cursor-pointer"
                            title="Нажмите для изменения"
                            onClick={() => handleStartEdit(variant)}
                          >
                            {variant.stocked_quantity}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-3 font-mono text-ui-fg-muted">
                        {variant.reserved_quantity}
                      </td>
                      <td className="px-6 py-3">
                        <Badge size="2xsmall" color={available > 0 ? "green" : "red"}>
                          {available}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        {!isEditing && (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => handleStartEdit(variant)}
                          >
                            Изменить
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Container>
        ))
      )}
    </div>
  )
}

export default InventoryManagementPage
