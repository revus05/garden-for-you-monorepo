import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_CONFIG_MODULE } from "../../../modules/site-config"
import SiteConfigModuleService from "../../../modules/site-config/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const siteConfigService: SiteConfigModuleService = req.scope.resolve(SITE_CONFIG_MODULE)
    const configs = await siteConfigService.listConfigs()
    res.json({ configs })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    const siteConfigService: SiteConfigModuleService = req.scope.resolve(SITE_CONFIG_MODULE)
    const body = req.body as Record<string, string>

    if (body.configs) {
        let incoming: Record<string, string>
        try {
            incoming = JSON.parse(body.configs)
        } catch {
            return res.status(400).json({ success: false, error: "Invalid configs JSON" })
        }

        const existing = await siteConfigService.listConfigs()
        const existingMap = new Map(existing.map((c) => [c.key, c]))

        for (const [key, value] of Object.entries(incoming)) {
            if (existingMap.has(key)) {
                await siteConfigService.updateConfigs({ id: existingMap.get(key)!.id, value })
            } else {
                await siteConfigService.createConfigs({ key, value })
            }
        }

        return res.json({ success: true })
    }

    const { key, value } = body
    if (!key) {
        return res.status(400).json({ success: false, error: "key is required" })
    }

    const existing = await siteConfigService.listConfigs({ key })
    if (existing.length) {
        await siteConfigService.updateConfigs({ id: existing[0].id, value })
    } else {
        await siteConfigService.createConfigs({ key, value })
    }

    res.json({ success: true })
}
