import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const notificationProviders: {
  resolve: string
  id: string
  options: Record<string, unknown> & {
    channels: string[]
  }
}[] = [
]

// Always register local provider for in-app (feed) notifications
notificationProviders.push({
  resolve: "@medusajs/notification-local",
  id: "local",
  options: {
    channels: ["feed"],
  },
})

if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
  notificationProviders.push({
    resolve: "./src/providers/notification-resend",
    id: "resend",
    options: {
      channels: ["email"],
      api_key: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM,
    },
  })
} else {
  notificationProviders.push({
    resolve: "@medusajs/notification-local",
    id: "local-email",
    options: {
      channels: ["email"],
    },
  })
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
        ],
      },
    },
    {
      resolve: "./src/modules/store-review",
    },
    {
      resolve: "./src/modules/site-config",
    },
    {
      resolve: "./src/modules/product-spec",
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: notificationProviders,
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "./src/providers/file-cloudinary",
            id: "cloudinary",
            options: {
              apiKey: process.env.CLOUDINARY_API_KEY,
              apiSecret: process.env.CLOUDINARY_API_SECRET,
              cloudName: process.env.CLOUDINARY_CLOUD_NAME,
              folderName: process.env.CLOUDINARY_FOLDER_NAME || "medusa",
              secure: true,
            },
          },
        ],
      },
    },
  ],
})
