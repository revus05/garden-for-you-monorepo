import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Button, Text, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { sdk } from "../../lib/sdk"

type ConfigEntry = { key: string; value: string }

type Section = {
    title: string
    fields: {
        key: string
        label: string
        type: "input" | "textarea"
        placeholder?: string
        description?: string
    }[]
}

const SECTIONS: Section[] = [
    {
        title: "Контакты",
        fields: [
            { key: "phone", label: "Телефон", type: "input", placeholder: "+7 (999) 000-00-00" },
            { key: "email", label: "Email", type: "input", placeholder: "info@example.com" },
            { key: "address", label: "Адрес", type: "input", placeholder: "г. Москва, ул. Цветочная, 1" },
        ],
    },
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
        title: "Социальные сети",
        fields: [
            { key: "vk_url", label: "ВКонтакте", type: "input", placeholder: "https://vk.com/..." },
            { key: "telegram_url", label: "Telegram", type: "input", placeholder: "https://t.me/..." },
            { key: "instagram_url", label: "Instagram", type: "input", placeholder: "https://instagram.com/..." },
        ],
    },
    {
        title: "Тексты на сайте",
        fields: [
            {
                key: "about_short",
                label: "Краткое описание (для шапки/футера)",
                type: "textarea",
                placeholder: "Магазин живых цветов и растений",
            },
        ],
    },
]

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
