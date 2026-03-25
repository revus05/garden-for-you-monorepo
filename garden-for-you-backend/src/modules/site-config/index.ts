import SiteConfigModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const SITE_CONFIG_MODULE = "site_config"

export default Module(SITE_CONFIG_MODULE, {
    service: SiteConfigModuleService,
})