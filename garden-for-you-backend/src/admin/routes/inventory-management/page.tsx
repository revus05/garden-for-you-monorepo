import { Buildings } from "@medusajs/icons"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Heading,
  Input,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Fragment, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../../lib/sdk"

export const config = defineRouteConfig({
  label: "Склад",
  icon: Buildings,
  rank: 44,
})

type VariantOption = { title: string | null; value: string | null }
type VariantPrice = { id: string; amount: number; currency_code: string }

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
  options: VariantOption[]
  prices: VariantPrice[]
}

type ProductGroup = {
  title: string
  thumbnail: string | null
  variants: VariantInventory[]
}

type BulkMode = "all" | "option" | "variants"

const INVENTORY_QUERY_KEY = ["admin", "inventory"] as const

const InventoryManagementPage = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Bulk panel state
  const [bulkMode, setBulkMode] = useState<BulkMode>("all")
  const [bulkDelta, setBulkDelta] = useState<string>("")
  const [bulkOptionTitle, setBulkOptionTitle] = useState<string>("")
  const [bulkOptionValue, setBulkOptionValue] = useState<string>("")

  const { data: variants = [], isLoading } = useQuery({
    queryKey: INVENTORY_QUERY_KEY,
    queryFn: async () => {
      const res = await sdk.client.fetch<{ variants: VariantInventory[] }>(
        "/admin/inventory",
        { method: "GET" }
      )
      return res.variants
    },
  })

  // --- Mutations ---
  const stockMutation = useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: string; quantity: number }) => {
      await sdk.client.fetch(`/admin/inventory/${variantId}`, {
        method: "PUT",
        body: { stocked_quantity: quantity },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      toast.success("Остаток обновлён")
    },
    onError: () => toast.error("Не удалось обновить остаток"),
  })

  const bulkMutation = useMutation({
    mutationFn: async (body: Record<string, any>) => {
      return await sdk.client.fetch<{ updated_count: number }>(
        "/admin/inventory/bulk",
        { method: "POST", body }
      )
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      toast.success(`Обновлено: ${res.updated_count}`)
      setBulkDelta("")
    },
    onError: (e: any) =>
      toast.error(e?.message ?? "Не удалось применить массовое изменение"),
  })

  const priceMutation = useMutation({
    mutationFn: async (updates: { id: string; amount: number }[]) => {
      await sdk.client.fetch("/admin/inventory/prices", {
        method: "POST",
        body: { updates },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      toast.success("Цена обновлена")
    },
    onError: () => toast.error("Не удалось обновить цену"),
  })

  // --- Derived data ---
  const { optionTitles, valuesByTitle } = useMemo(() => {
    const titles = new Set<string>()
    const map = new Map<string, Set<string>>()
    for (const v of variants) {
      for (const o of v.options) {
        if (!o.title || !o.value) continue
        titles.add(o.title)
        if (!map.has(o.title)) map.set(o.title, new Set())
        map.get(o.title)!.add(o.value)
      }
    }
    return {
      optionTitles: Array.from(titles).sort(),
      valuesByTitle: map,
    }
  }, [variants])

  const currencies = useMemo(() => {
    const s = new Set<string>()
    for (const v of variants) for (const p of v.prices) s.add(p.currency_code)
    return Array.from(s).sort()
  }, [variants])

  const searchLower = search.trim().toLowerCase()
  const filtered = searchLower
    ? variants.filter(
        (v) =>
          v.product_title?.toLowerCase().includes(searchLower) ||
          v.title.toLowerCase().includes(searchLower) ||
          v.sku?.toLowerCase().includes(searchLower)
      )
    : variants

  const productGroups = useMemo(() => {
    return filtered.reduce<Record<string, ProductGroup>>((acc, v) => {
      if (!acc[v.product_id]) {
        acc[v.product_id] = {
          title: v.product_title ?? v.product_id,
          thumbnail: v.product_thumbnail,
          variants: [],
        }
      }
      acc[v.product_id].variants.push(v)
      return acc
    }, {})
  }, [filtered])

  const totalStocked = variants.reduce((s, v) => s + v.stocked_quantity, 0)
  const totalReserved = variants.reduce((s, v) => s + v.reserved_quantity, 0)
  const outOfStock = variants.filter(
    (v) => v.stocked_quantity - v.reserved_quantity <= 0
  ).length

  // --- Selection helpers ---
  const toggleVariant = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleGroup = (groupVariants: VariantInventory[]) => {
    const ids = groupVariants.map((v) => v.id)
    const allSelected = ids.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) ids.forEach((id) => next.delete(id))
      else ids.forEach((id) => next.add(id))
      return next
    })
  }

  const toggleAllFiltered = () => {
    const ids = filtered.map((v) => v.id)
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id))
    setSelectedIds(allSelected ? new Set() : new Set(ids))
  }

  const clearSelection = () => setSelectedIds(new Set())

  // --- Bulk submit ---
  const handleBulkSubmit = () => {
    const delta = parseInt(bulkDelta, 10)
    if (isNaN(delta) || delta === 0) {
      toast.error("Введите ненулевое целое число")
      return
    }
    if (bulkMode === "option") {
      if (!bulkOptionTitle || !bulkOptionValue) {
        toast.error("Выберите опцию и значение")
        return
      }
      bulkMutation.mutate({
        mode: "option",
        delta,
        option_title: bulkOptionTitle,
        option_value: bulkOptionValue,
      })
    } else if (bulkMode === "variants") {
      if (selectedIds.size === 0) {
        toast.error("Не выбрано ни одного варианта")
        return
      }
      bulkMutation.mutate({
        mode: "variants",
        delta,
        variant_ids: Array.from(selectedIds),
      })
    } else {
      bulkMutation.mutate({ mode: "all", delta })
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Header */}
      <Container className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <Heading level="h1">Управление складом</Heading>
            <Text size="xsmall" className="text-ui-fg-muted">
              Массовое и точечное редактирование остатков и цен.
            </Text>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Поиск по товару, варианту, SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72"
              size="small"
            />
            <div className="flex items-center gap-3 text-xs">
              <span className="text-ui-fg-muted">
                Всего:{" "}
                <span className="text-ui-fg-base font-mono">
                  {totalStocked.toLocaleString("ru-RU")}
                </span>
              </span>
              <span className="text-ui-fg-muted">
                Резерв:{" "}
                <span className="text-ui-fg-base font-mono">
                  {totalReserved.toLocaleString("ru-RU")}
                </span>
              </span>
              <span className={outOfStock > 0 ? "text-ui-fg-error" : "text-ui-fg-muted"}>
                Нет в наличии:{" "}
                <span className="font-mono">{outOfStock}</span>
              </span>
            </div>
          </div>
        </div>
      </Container>

      {/* Bulk panel */}
      <Container className="p-0">
        <div className="flex flex-wrap items-end gap-3 px-4 py-3">
          <div className="flex flex-col gap-1">
            <Text size="xsmall" className="text-ui-fg-muted">Режим</Text>
            <Select
              value={bulkMode}
              onValueChange={(v) => setBulkMode(v as BulkMode)}
            >
              <Select.Trigger className="h-8 w-56">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">Ко всем вариантам</Select.Item>
                <Select.Item value="option">По значению опции</Select.Item>
                <Select.Item value="variants">
                  К выбранным ({selectedIds.size})
                </Select.Item>
              </Select.Content>
            </Select>
          </div>

          {bulkMode === "option" && (
            <>
              <div className="flex flex-col gap-1">
                <Text size="xsmall" className="text-ui-fg-muted">Опция</Text>
                <Select
                  value={bulkOptionTitle}
                  onValueChange={(v) => {
                    setBulkOptionTitle(v)
                    setBulkOptionValue("")
                  }}
                >
                  <Select.Trigger className="h-8 w-40">
                    <Select.Value placeholder="Например, Возраст" />
                  </Select.Trigger>
                  <Select.Content>
                    {optionTitles.map((t) => (
                      <Select.Item key={t} value={t}>{t}</Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Text size="xsmall" className="text-ui-fg-muted">Значение</Text>
                <Select
                  value={bulkOptionValue}
                  onValueChange={setBulkOptionValue}
                  disabled={!bulkOptionTitle}
                >
                  <Select.Trigger className="h-8 w-40">
                    <Select.Value placeholder="Например, 1 год" />
                  </Select.Trigger>
                  <Select.Content>
                    {(bulkOptionTitle
                      ? Array.from(valuesByTitle.get(bulkOptionTitle) ?? new Set<string>()).sort()
                      : []
                    ).map((val) => (
                      <Select.Item key={val} value={val}>{val}</Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <Text size="xsmall" className="text-ui-fg-muted">
              Изменение остатка (можно минус)
            </Text>
            <Input
              className="h-8 w-32"
              type="number"
              placeholder="+10 или -5"
              value={bulkDelta}
              onChange={(e) => setBulkDelta(e.target.value)}
              size="small"
            />
          </div>

          <Button
            size="small"
            onClick={handleBulkSubmit}
            isLoading={bulkMutation.isPending}
          >
            Применить
          </Button>

          {selectedIds.size > 0 && (
            <Button size="small" variant="secondary" onClick={clearSelection}>
              Снять выбор ({selectedIds.size})
            </Button>
          )}
        </div>
      </Container>

      {/* Table */}
      {isLoading ? (
        <Container className="px-4 py-10 text-center">
          <Text className="text-ui-fg-muted">Загрузка…</Text>
        </Container>
      ) : Object.keys(productGroups).length === 0 ? (
        <Container className="px-4 py-10 text-center">
          <Text className="text-ui-fg-muted">
            {search ? "По запросу ничего не найдено" : "Нет товаров с вариантами"}
          </Text>
        </Container>
      ) : (
        <Container className="p-0">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-ui-bg-base border-b border-ui-border-base">
              <tr className="text-left text-ui-fg-muted">
                <th className="w-8 px-3 py-2">
                  <Checkbox
                    checked={
                      filtered.length > 0 &&
                      filtered.every((v) => selectedIds.has(v.id))
                    }
                    onCheckedChange={toggleAllFiltered}
                  />
                </th>
                <th className="px-3 py-2 font-medium">Товар / вариант</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium text-right">Остаток</th>
                <th className="px-3 py-2 font-medium text-right">Резерв</th>
                <th className="px-3 py-2 font-medium text-right">Доступно</th>
                {currencies.map((c) => (
                  <th key={c} className="px-3 py-2 font-medium text-right uppercase">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(productGroups).map(([productId, group]) => {
                const groupIds = group.variants.map((v) => v.id)
                const allSelected =
                  groupIds.length > 0 && groupIds.every((id) => selectedIds.has(id))
                const anySelected = groupIds.some((id) => selectedIds.has(id))

                return (
                  <Fragment key={productId}>
                    <tr className="border-t border-ui-border-base bg-ui-bg-subtle">
                      <td className="px-3 py-2">
                        <Checkbox
                          checked={
                            allSelected ? true : anySelected ? "indeterminate" : false
                          }
                          onCheckedChange={() => toggleGroup(group.variants)}
                        />
                      </td>
                      <td className="px-3 py-2" colSpan={5 + currencies.length}>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/products/${productId}`}
                            className="flex items-center gap-2 hover:text-ui-fg-interactive min-w-0"
                          >
                            {group.thumbnail && (
                              <img
                                src={group.thumbnail}
                                alt={group.title}
                                className="h-6 w-6 rounded object-cover shrink-0"
                              />
                            )}
                            <span className="font-medium truncate">
                              {group.title}
                            </span>
                          </Link>
                          <Badge size="2xsmall" color="grey">
                            {group.variants.length}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                    {group.variants.map((variant) => (
                      <VariantRow
                        key={variant.id}
                        variant={variant}
                        currencies={currencies}
                        selected={selectedIds.has(variant.id)}
                        onToggle={() => toggleVariant(variant.id)}
                        onSaveStock={(qty) =>
                          stockMutation.mutate({ variantId: variant.id, quantity: qty })
                        }
                        onSavePrice={(priceId, amount) =>
                          priceMutation.mutate([{ id: priceId, amount }])
                        }
                      />
                    ))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </Container>
      )}
    </div>
  )
}

// ---- Row component ----

type RowProps = {
  variant: VariantInventory
  currencies: string[]
  selected: boolean
  onToggle: () => void
  onSaveStock: (qty: number) => void
  onSavePrice: (priceId: string, amount: number) => void
}

const VariantRow = ({
  variant,
  currencies,
  selected,
  onToggle,
  onSaveStock,
  onSavePrice,
}: RowProps) => {
  const available = variant.stocked_quantity - variant.reserved_quantity

  return (
    <tr className="border-t border-ui-border-base hover:bg-ui-bg-subtle-hover">
      <td className="px-3 py-1.5">
        <Checkbox checked={selected} onCheckedChange={onToggle} />
      </td>
      <td className="px-3 py-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            to={`/products/${variant.product_id}/variants/${variant.id}`}
            className="font-medium hover:text-ui-fg-interactive"
          >
            {variant.title}
          </Link>
          {variant.options
            .filter((o) => o.title && o.value)
            .map((o, i) => (
              <span
                key={i}
                className="text-[10px] text-ui-fg-muted bg-ui-bg-subtle rounded px-1.5 py-0.5"
              >
                {o.title}: {o.value}
              </span>
            ))}
        </div>
      </td>
      <td className="px-3 py-1.5 font-mono text-ui-fg-muted">
        {variant.sku ?? "—"}
      </td>
      <td className="px-3 py-1.5 text-right">
        <InlineNumber
          value={variant.stocked_quantity}
          min={0}
          onSave={onSaveStock}
        />
      </td>
      <td className="px-3 py-1.5 text-right font-mono text-ui-fg-muted">
        {variant.reserved_quantity}
      </td>
      <td className="px-3 py-1.5 text-right">
        <Badge size="2xsmall" color={available > 0 ? "green" : "red"}>
          {available}
        </Badge>
      </td>
      {currencies.map((c) => {
        const price = variant.prices.find((p) => p.currency_code === c)
        if (!price) {
          return (
            <td key={c} className="px-3 py-1.5 text-right text-ui-fg-muted">
              —
            </td>
          )
        }
        return (
          <td key={c} className="px-3 py-1.5 text-right">
            <InlineNumber
              value={price.amount}
              min={0}
              allowDecimal
              onSave={(amount) => onSavePrice(price.id, amount)}
            />
          </td>
        )
      })}
    </tr>
  )
}

// Compact inline editor. Renders as a small number input — changes commit
// on blur or Enter, revert on Escape. No separate edit mode toggle.
const InlineNumber = ({
  value,
  min,
  allowDecimal,
  onSave,
}: {
  value: number
  min?: number
  allowDecimal?: boolean
  onSave: (val: number) => void
}) => {
  const [local, setLocal] = useState(String(value))
  const [focused, setFocused] = useState(false)

  // Keep local state in sync with external value when not focused.
  const displayValue = focused ? local : String(value)

  const commit = () => {
    const parsed = allowDecimal ? parseFloat(local) : parseInt(local, 10)
    if (isNaN(parsed) || (min !== undefined && parsed < min)) {
      setLocal(String(value))
      return
    }
    if (parsed !== value) onSave(parsed)
  }

  return (
    <input
      type="number"
      min={min}
      step={allowDecimal ? "0.01" : "1"}
      className="h-7 w-20 rounded border border-ui-border-base bg-ui-bg-field px-2 text-right font-mono text-xs focus:border-ui-border-interactive focus:outline-none"
      value={displayValue}
      onFocus={() => {
        setLocal(String(value))
        setFocused(true)
      }}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        setFocused(false)
        commit()
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          ;(e.target as HTMLInputElement).blur()
        } else if (e.key === "Escape") {
          setLocal(String(value))
          ;(e.target as HTMLInputElement).blur()
        }
      }}
    />
  )
}

export default InventoryManagementPage
