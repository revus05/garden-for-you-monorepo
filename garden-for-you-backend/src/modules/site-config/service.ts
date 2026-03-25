import { MedusaService } from "@medusajs/framework/utils"
import { Config } from "./models/config"

class SiteConfigModuleService extends MedusaService({
    Config,
}) {}

export default SiteConfigModuleService