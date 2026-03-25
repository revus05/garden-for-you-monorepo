import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_CONFIG_MODULE } from "../../../modules/site-config"
import SiteConfigModuleService from "../../../modules/site-config/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const siteConfigService: SiteConfigModuleService = req.scope.resolve(SITE_CONFIG_MODULE)
    const configs = await siteConfigService.listConfigs()

    const result: Record<string, string> = {}
    configs.forEach((c) => {
        result[c.key] = c.value
    })

    res.json({ configs: result })
}
