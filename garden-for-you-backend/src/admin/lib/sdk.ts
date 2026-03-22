import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: typeof __BACKEND_URL__ !== "undefined" ? __BACKEND_URL__ : "/",
  auth: {
    type:
      typeof __AUTH_TYPE__ !== "undefined"
        ? (__AUTH_TYPE__ as "session" | "jwt")
        : "session",
    jwtTokenStorageKey:
      typeof __JWT_TOKEN_STORAGE_KEY__ !== "undefined"
        ? __JWT_TOKEN_STORAGE_KEY__
        : undefined,
  },
})
