import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Input, Select, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/sdk"

type SpecType = "text" | "number" | "boolean" | "select"

type SpecDefinition = {
  id: string
  name: string
  key: string
  unit: string | null
  type: SpecType
  options: string[] | null
  sort_order: number
}

type ProductSpec = {
  id: string
  product_id: string
  value: string
  definition_id: string
  definition: SpecDefinition
}

// Виджет вставляется на страницу деталей товара
// https://docs.medusajs.com/resources/admin-components/widgets
const ProductSpecsWidget = ({ data }: { data: { id: string } }) => {
  const productId = data.id
  const queryClient = useQueryClient()
  // Черновик: definition_id -> value
  const [draft, setDraft] = useState<Record<string, string> | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const { data: definitionsData } = useQuery({
    queryKey: ["admin", "spec-definitions"],
    queryFn: async () => {
      const res = await sdk.client.fetch<{ definitions: SpecDefinition[] }>(
        "/admin/product-specs/definitions",
        { method: "GET" }
      )
      return res.definitions
    },
  })

  const { data: specsData, isLoading } = useQuery({
    queryKey: ["admin", "product-specs", productId],
    queryFn: async () => {
      const res = await sdk.client.fetch<{ specs: ProductSpec[] }>(
        `/admin/products/${productId}/specs`,
        { method: "GET" }
      )
      return res.specs
    },
  })

  const definitions = definitionsData ?? []
  const specs = specsData ?? []

  // Строим начальное состояние черновика из текущих значений
  const buildDraft = (): Record<string, string> => {
    const map: Record<string, string> = {}
    for (const spec of specs) {
      map[spec.definition_id] = spec.value
    }
    return map
  }

  const handleStartEdit = () => {
    setDraft(buildDraft())
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraft(null)
    setIsEditing(false)
  }

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      // Отправляем только заполненные поля
      const specsPayload = Object.entries(values)
        .filter(([, val]) => val.trim() !== "")
        .map(([definition_id, value]) => ({ definition_id, value: value.trim() }))

      // Удаляем очищенные поля
      const cleared = Object.entries(values)
        .filter(([, val]) => val.trim() === "")
        .map(([definition_id]) => definition_id)

      for (const defId of cleared) {
        const existing = specs.find((s) => s.definition_id === defId)
        if (existing) {
          await sdk.client.fetch(
            `/admin/products/${productId}/specs/${existing.id}`,
            { method: "DELETE" }
          )
        }
      }

      if (specsPayload.length > 0) {
        await sdk.client.fetch(`/admin/products/${productId}/specs`, {
          method: "POST",
          body: { specs: specsPayload },
        })
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "product-specs", productId],
      })
      toast.success("Характеристики сохранены")
      setDraft(null)
      setIsEditing(false)
    },
    onError: () => toast.error("Не удалось сохранить характеристики"),
  })

  const handleSave = () => {
    if (draft) saveMutation.mutate(draft)
  }

  const renderViewValue = (spec: ProductSpec) => {
    const def = spec.definition
    if (def.type === "boolean") {
      return spec.value === "true" ? "Да" : "Нет"
    }
    return def.unit ? `${spec.value} ${def.unit}` : spec.value
  }

  const renderEditField = (def: SpecDefinition) => {
    const value = draft?.[def.id] ?? ""

    if (def.type === "boolean") {
      return (
        <Select
          value={value}
          onValueChange={(v) => setDraft((p) => ({ ...(p ?? {}), [def.id]: v }))}
        >
          <Select.Trigger className="h-8">
            <Select.Value placeholder="Не задано" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="">Не задано</Select.Item>
            <Select.Item value="true">Да</Select.Item>
            <Select.Item value="false">Нет</Select.Item>
          </Select.Content>
        </Select>
      )
    }

    if (def.type === "select" && def.options) {
      const options = def.options as unknown as string[]
      return (
        <Select
          value={value}
          onValueChange={(v) => setDraft((p) => ({ ...(p ?? {}), [def.id]: v }))}
        >
          <Select.Trigger className="h-8">
            <Select.Value placeholder="Не задано" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="">Не задано</Select.Item>
            {options.map((opt) => (
              <Select.Item key={opt} value={opt}>
                {opt}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      )
    }

    return (
      <Input
        className="h-8"
        type={def.type === "number" ? "number" : "text"}
        placeholder={def.unit ? `Значение (${def.unit})` : "Значение"}
        value={value}
        onChange={(e) =>
          setDraft((p) => ({ ...(p ?? {}), [def.id]: e.target.value }))
        }
      />
    )
  }

  if (isLoading) {
    return (
      <Container className="px-6 py-4">
        <Text className="text-ui-fg-muted text-sm">Загрузка характеристик…</Text>
      </Container>
    )
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <Heading level="h2">Характеристики</Heading>
        {!isEditing ? (
          <Button size="small" variant="secondary" onClick={handleStartEdit}>
            Редактировать
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              size="small"
              isLoading={saveMutation.isPending}
              onClick={handleSave}
            >
              Сохранить
            </Button>
            <Button size="small" variant="secondary" onClick={handleCancel}>
              Отмена
            </Button>
          </div>
        )}
      </div>

      {definitions.length === 0 && (
        <div className="px-6 py-4">
          <Text className="text-ui-fg-muted text-sm">
            Нет доступных характеристик.{" "}
            <a href="/app/product-specs" className="text-ui-fg-interactive hover:underline">
              Создайте их в справочнике.
            </a>
          </Text>
        </div>
      )}

      {!isEditing && definitions.length > 0 && (
        <div className="divide-y divide-ui-border-base">
          {definitions.map((def) => {
            const spec = specs.find((s) => s.definition_id === def.id)
            return (
              <div
                key={def.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="flex items-center gap-2">
                  <Text size="small" weight="plus">
                    {def.name}
                  </Text>
                  {def.unit && (
                    <Badge size="2xsmall" color="grey">
                      {def.unit}
                    </Badge>
                  )}
                </div>
                <Text size="small" className="text-ui-fg-muted">
                  {spec ? renderViewValue(spec) : "—"}
                </Text>
              </div>
            )
          })}
        </div>
      )}

      {isEditing && definitions.length > 0 && (
        <div className="divide-y divide-ui-border-base">
          {definitions.map((def) => (
            <div
              key={def.id}
              className="flex items-center justify-between gap-4 px-6 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Text size="small" weight="plus" className="truncate">
                  {def.name}
                </Text>
                {def.unit && (
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {def.unit}
                  </Text>
                )}
              </div>
              <div className="w-48 shrink-0">{renderEditField(def)}</div>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductSpecsWidget
