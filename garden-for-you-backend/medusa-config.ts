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

const hasCloudinary =
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME

const fileProviders = hasCloudinary
  ? [
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
    ]
  : [
      {
        resolve: "@medusajs/file-local",
        id: "local",
        options: {
          upload_dir: "static",
          backend_url: `${process.env.MEDUSA_BACKEND_URL || ""}/static`,
        },
      },
    ]

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Medusa enables Postgres SSL by default in production. The bundled
    // postgres image has no SSL, so keep it off unless DATABASE_SSL=true
    // (set that for a managed/cloud DB that requires SSL).
    databaseDriverOptions:
      process.env.DATABASE_SSL === "true"
        ? { connection: { ssl: { rejectUnauthorized: false } } }
        : { connection: { ssl: false } },
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
        providers: fileProviders,
      },
    },
  ],
})
