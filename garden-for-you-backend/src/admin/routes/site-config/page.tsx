import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Button, Text, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useRef, useDeferredValue } from "react"
import { sdk } from "../../lib/sdk"

type ConfigEntry = { key: string; value: string }

type FieldDef = {
    key: string
    label: string
    type: "input" | "textarea" | "product-select"
    placeholder?: string
    description?: string
}

type Section = {
    title: string
    fields: FieldDef[]
}

const SECTIONS: Section[] = [
    {
        title: "График работы",
        fields: [
            {
                key: "work_schedule",
                label: "График работы",
                type: "textarea",
                placeholder: "Пн–Пт: 9:00 – 20:00\nСб–Вс: 10:00 – 18:00",
                description: "Каждая строка — отдельная запись",
            },
        ],
    },
    {
        title: "Скидки на главной",
        fields: [
            { key: "sale.percent", label: "Размер скидки", type: "input", placeholder: "50%" },
            { key: "sale.description", label: "Описание скидки", type: "textarea", placeholder: "В день рождения" },
            {
                key: "sale.product_handle",
                label: "Товар по кнопке «Подробнее»",
                type: "product-select",
                description: "Товар, на который ведёт кнопка на карточке акции",
            },
        ],
    },
]

type AdminProduct = { id: string; handle: string; title: string }

const ProductSelect = ({
    value,
    onChange,
}: {
    value: string
    onChange: (handle: string) => void
}) => {
    const [searchText, setSearchText] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const deferredSearch = useDeferredValue(searchText)
    const containerRef = useRef<HTMLDivElement>(null)

    const { data: searchData, isFetching } = useQuery({
        queryKey: ["admin", "products-search", deferredSearch],
        queryFn: () =>
            sdk.admin.product.list({
                q: deferredSearch || undefined,
                limit: 20,
                fields: "id,handle,title",
            } as Parameters<typeof sdk.admin.product.list>[0]),
        staleTime: 30_000,
        enabled: isOpen,
    })

    const { data: selectedData } = useQuery({
        queryKey: ["admin", "product-by-handle", value],
        queryFn: () =>
            sdk.client.fetch<{ products: AdminProduct[] }>(
                `/admin/products?handle=${value}&fields=id,handle,title`,
            ),
        enabled: !!value,
        staleTime: Number.POSITIVE_INFINITY,
    })

    const selectedTitle = selectedData?.products?.[0]?.title ?? value
    const products = (searchData?.products ?? []) as AdminProduct[]

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setSearchText("")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (product: AdminProduct) => {
        onChange(product.handle)
        setIsOpen(false)
        setSearchText("")
    }

    return (
        <div ref={containerRef} className="relative">
            {isOpen ? (
                <>
                    <Input
                        placeholder="Поиск товара..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        autoFocus
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-ui-bg-base border border-ui-border-base rounded-md shadow-elevation-modal z-50 max-h-64 overflow-y-auto">
                        {isFetching && (
                            <div className="px-3 py-2 text-sm text-ui-fg-muted">Загрузка...</div>
                        )}
                        {!isFetching && products.length === 0 && (
                            <div className="px-3 py-2 text-sm text-ui-fg-muted">Товары не найдены</div>
                        )}
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className={`px-3 py-2 cursor-pointer hover:bg-ui-bg-base-hover ${product.handle === value ? "bg-ui-bg-base-pressed" : ""}`}
                                onMouseDown={() => handleSelect(product)}
                            >
                                <Text size="small" weight="plus">{product.title}</Text>
                                <Text size="xsmall" className="text-ui-fg-muted">{product.handle}</Text>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex gap-2 items-center">
                    <div
                        className="flex-1 border border-ui-border-base rounded-md px-3 py-1.75 text-sm cursor-pointer hover:border-ui-border-interactive transition-colors"
                        onClick={() => setIsOpen(true)}
                    >
                        {value ? (
                            <Text size="small">{selectedTitle}</Text>
                        ) : (
                            <Text size="small" className="text-ui-fg-muted">Выберите товар...</Text>
                        )}
                    </div>
                    {value && (
                        <Button variant="secondary" size="small" onClick={() => onChange("")}>
                            Сбросить
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

const SiteConfigPage = () => {
    const queryClient = useQueryClient()
    const [values, setValues] = useState<Record<string, string>>({})

    const { data, isLoading } = useQuery({
        queryKey: ["admin", "site-config"],
        queryFn: async () => {
            return sdk.client.fetch<{ configs: ConfigEntry[] }>("/admin/site-config")
        },
    })

    useEffect(() => {
        if (!data?.configs) return
        const initial: Record<string, string> = {}
        data.configs.forEach((c) => {
            initial[c.key] = c.value
        })
        setValues(initial)
    }, [data])

    const saveMutation = useMutation({
        mutationFn: async () => {
            await sdk.client.fetch("/admin/site-config", {
                method: "POST",
                body: { configs: JSON.stringify(values) },
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin", "site-config"] })
            toast.success("Настройки сохранены")
        },
        onError: () => {
            toast.error("Ошибка при сохранении")
        },
    })

    if (isLoading) {
        return (
            <Container className="p-6">
                <Text>Загрузка…</Text>
            </Container>
        )
    }

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Heading level="h1">Настройки сайта</Heading>
                    <Text className="text-ui-fg-subtle mt-1">
                        Значения, которые отображаются на страницах сайта
                    </Text>
                </div>
                <Button
                    onClick={() => saveMutation.mutate()}
                    isLoading={saveMutation.isPending}
                    disabled={saveMutation.isPending}
                >
                    Сохранить всё
                </Button>
            </div>

            {SECTIONS.map(({ title, fields }) => (
                <Container key={title} className="divide-y p-0">
                    <div className="px-6 py-4">
                        <Heading level="h2">{title}</Heading>
                    </div>
                    <div className="p-6 flex flex-col gap-y-4">
                        {fields.map(({ key, label, type, placeholder, description }) => (
                            <div key={key} className="flex flex-col gap-y-1">
                                <Text size="small" weight="plus">
                                    {label}
                                </Text>
                                {description && (
                                    <Text size="small" className="text-ui-fg-subtle">
                                        {description}
                                    </Text>
                                )}
                                {type === "textarea" ? (
                                    <Textarea
                                        placeholder={placeholder}
                                        value={values[key] ?? ""}
                                        onChange={(e) =>
                                            setValues((prev) => ({ ...prev, [key]: e.target.value }))
                                        }
                                        rows={4}
                                    />
                                ) : type === "product-select" ? (
                                    <ProductSelect
                                        value={values[key] ?? ""}
                                        onChange={(handle) =>
                                            setValues((prev) => ({ ...prev, [key]: handle }))
                                        }
                                    />
                                ) : (
                                    <Input
                                        placeholder={placeholder}
                                        value={values[key] ?? ""}
                                        onChange={(e) =>
                                            setValues((prev) => ({ ...prev, [key]: e.target.value }))
                                        }
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </Container>
            ))}
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Настройки сайта",
})

export default SiteConfigPage
