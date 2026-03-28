import {Tag} from "@medusajs/icons"
import {defineRouteConfig} from "@medusajs/admin-sdk"
import {Badge, Button, Container, Heading, Input, Label, Select, Text, toast,} from "@medusajs/ui"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {useState} from "react"
import {sdk} from "../../lib/sdk"

export const config = defineRouteConfig({
  label: "Характеристики",
  icon: Tag,
  rank: 43,
})

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

const TYPE_LABELS: Record<SpecType, string> = {
  text: "Текст",
  number: "Число",
  boolean: "Да/Нет",
  select: "Выбор из списка",
}

const emptyForm = () => ({
  name: "",
  key: "",
  unit: "",
  type: "text" as SpecType,
  options: "",
  sort_order: "0",
})

const ProductSpecsPage = () => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "spec-definitions"],
    queryFn: async () => {
      return await sdk.client.fetch<{ definitions: SpecDefinition[] }>(
          "/admin/product-specs/definitions",
          {method: "GET"}
      )
    },
  })

  const definitions = data?.definitions ?? []

  const saveMutation = useMutation({
    mutationFn: async (payload: Omit<SpecDefinition, "id">) => {
      if (editingId) {
        return sdk.client.fetch(`/admin/product-specs/definitions/${editingId}`, {
          method: "PUT",
          body: payload,
        })
      }
      return sdk.client.fetch("/admin/product-specs/definitions", {
        method: "POST",
        body: payload,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "spec-definitions"] })
      toast.success(editingId ? "Характеристика обновлена" : "Характеристика создана")
      setForm(emptyForm())
      setEditingId(null)
      setShowForm(false)
    },
    onError: () => toast.error("Не удалось сохранить"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return sdk.client.fetch(`/admin/product-specs/definitions/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "spec-definitions"] })
      toast.success("Характеристика удалена")
    },
    onError: () => toast.error("Не удалось удалить"),
  })

  const handleEdit = (def: SpecDefinition) => {
    setForm({
      name: def.name,
      key: def.key,
      unit: def.unit ?? "",
      type: def.type,
      options: def.options ? def.options.join(", ") : "",
      sort_order: String(def.sort_order),
    })
    setEditingId(def.id)
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.key.trim()) {
      toast.error("Название и ключ обязательны")
      return
    }

    const optionsArray =
      form.type === "select" && form.options.trim()
        ? form.options.split(",").map((o) => o.trim()).filter(Boolean)
        : null

    saveMutation.mutate({
      name: form.name.trim(),
      key: form.key.trim(),
      unit: form.unit.trim() || null,
      type: form.type,
      options: optionsArray,
      sort_order: parseInt(form.sort_order, 10) || 0,
    })
  }

  const handleCancel = () => {
    setForm(emptyForm())
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <Container className="p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">Характеристики товаров</Heading>
            <Text size="small" className="text-ui-fg-muted mt-1">
              Справочник доступных характеристик для сравнения товаров
            </Text>
          </div>
          {!showForm && (
            <Button size="small" onClick={() => setShowForm(true)}>
              Добавить характеристику
            </Button>
          )}
        </div>
      </Container>

      {showForm && (
        <Container className="px-6 py-5">
          <Heading level="h2" className="mb-4">
            {editingId ? "Редактировать характеристику" : "Новая характеристика"}
          </Heading>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="spec-name" size="small">
                Название *
              </Label>
              <Input
                id="spec-name"
                placeholder="Размер косточки"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="spec-key" size="small">
                Ключ * (уникальный идентификатор)
              </Label>
              <Input
                id="spec-key"
                placeholder="seed_size"
                value={form.key}
                disabled={!!editingId}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="spec-type" size="small">
                Тип значения *
              </Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v as SpecType }))}
              >
                <Select.Trigger id="spec-type">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {(["text", "number", "boolean", "select"] as SpecType[]).map((t) => (
                    <Select.Item key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="spec-unit" size="small">
                Единица измерения (необязательно)
              </Label>
              <Input
                id="spec-unit"
                placeholder="см, г, °C ..."
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
              />
            </div>

            {form.type === "select" && (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <Label htmlFor="spec-options" size="small">
                  Варианты значений (через запятую) *
                </Label>
                <Input
                  id="spec-options"
                  placeholder="мелкая, средняя, крупная"
                  value={form.options}
                  onChange={(e) => setForm((p) => ({ ...p, options: e.target.value }))}
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <Label htmlFor="spec-order" size="small">
                Порядок сортировки
              </Label>
              <Input
                id="spec-order"
                type="number"
                placeholder="0"
                value={form.sort_order}
                onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button
              size="small"
              isLoading={saveMutation.isPending}
              onClick={handleSubmit}
            >
              {editingId ? "Сохранить изменения" : "Создать"}
            </Button>
            <Button size="small" variant="secondary" onClick={handleCancel}>
              Отмена
            </Button>
          </div>
        </Container>
      )}

      <Container className="p-0">
        <div className="px-6 py-4 border-b border-ui-border-base">
          <Text weight="plus">Существующие характеристики</Text>
        </div>

        {isLoading ? (
          <div className="px-6 py-4">
            <Text className="text-ui-fg-muted">Загрузка…</Text>
          </div>
        ) : definitions.length === 0 ? (
          <div className="px-6 py-4">
            <Text className="text-ui-fg-muted">
              Нет характеристик. Создайте первую, чтобы начать назначать их товарам.
            </Text>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ui-border-base text-ui-fg-muted text-left">
                <th className="px-6 py-3 font-medium">Название</th>
                <th className="px-6 py-3 font-medium">Ключ</th>
                <th className="px-6 py-3 font-medium">Тип</th>
                <th className="px-6 py-3 font-medium">Ед. измерения</th>
                <th className="px-6 py-3 font-medium">Варианты</th>
                <th className="px-6 py-3 font-medium">Порядок</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border-base">
              {definitions.map((def) => (
                <tr key={def.id} className="hover:bg-ui-bg-subtle-hover">
                  <td className="px-6 py-3 font-medium">{def.name}</td>
                  <td className="px-6 py-3 text-ui-fg-muted font-mono text-xs">
                    {def.key}
                  </td>
                  <td className="px-6 py-3">
                    <Badge size="2xsmall" color="grey">
                      {TYPE_LABELS[def.type]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-ui-fg-muted">{def.unit ?? "—"}</td>
                  <td className="px-6 py-3 text-ui-fg-muted">
                    {def.options && def.options.length > 0
                      ? (def.options as unknown as string[]).join(", ")
                      : "—"}
                  </td>
                  <td className="px-6 py-3 text-ui-fg-muted">{def.sort_order}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleEdit(def)}
                      >
                        Изменить
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        isLoading={deleteMutation.isPending}
                        onClick={() => {
                          if (window.confirm(`Удалить «${def.name}»? Это удалит значения у всех товаров.`)) {
                            deleteMutation.mutate(def.id)
                          }
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Container>
    </div>
  )
}

export default ProductSpecsPage
