/**
 * Centralized, typed environment access with collect-all-then-throw validation.
 *
 * NEXT_PUBLIC_* vars are referenced as literal `process.env.NEXT_PUBLIC_x`
 * expressions so Next.js can statically inline them into the client bundle.
 * Server-only keys are read behind a `typeof window` guard so they never ship
 * to the browser and never throw during client hydration.
 */

const isServer = typeof window === "undefined";

function read(
  name: string,
  value: string | undefined,
  missing: string[],
): string {
  if (!value) {
    missing.push(name);
    return "";
  }
  return value;
}

const publicMissing: string[] = [];

export const publicEnv = {
  NEXT_PUBLIC_MEDUSA_URL: read(
    "NEXT_PUBLIC_MEDUSA_URL",
    process.env.NEXT_PUBLIC_MEDUSA_URL,
    publicMissing,
  ),
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: read(
    "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    publicMissing,
  ),
  NEXT_PUBLIC_REGION_ID: read(
    "NEXT_PUBLIC_REGION_ID",
    process.env.NEXT_PUBLIC_REGION_ID,
    publicMissing,
  ),
  NEXT_PUBLIC_SITE_URL: read(
    "NEXT_PUBLIC_SITE_URL",
    process.env.NEXT_PUBLIC_SITE_URL,
    publicMissing,
  ),
  NEXT_PUBLIC_CONTENT_TABLE_URL: read(
    "NEXT_PUBLIC_CONTENT_TABLE_URL",
    process.env.NEXT_PUBLIC_CONTENT_TABLE_URL,
    publicMissing,
  ),
} as const;

if (publicMissing.length > 0) {
  throw new Error(
    `Missing required public env vars: ${publicMissing.join(", ")}`,
  );
}

const serverMissing: string[] = [];

export const serverEnv = {
  // Optional: set in the single-instance docker deploy to reach Medusa
  // server-to-server; falls back to NEXT_PUBLIC_MEDUSA_URL otherwise.
  MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL || undefined,
  REVALIDATE_SECRET: isServer
    ? read("REVALIDATE_SECRET", process.env.REVALIDATE_SECRET, serverMissing)
    : "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || undefined,
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || undefined,
} as const;

if (isServer && serverMissing.length > 0) {
  throw new Error(
    `Missing required server env vars: ${serverMissing.join(", ")}`,
  );
}

/**
 * Single source of truth for the Medusa base URL.
 * Server prefers the internal backend URL; the browser always uses the public
 * URL (it cannot reach an internal docker hostname).
 */
export function resolveMedusaBaseUrl(): string {
  if (isServer) {
    return serverEnv.MEDUSA_BACKEND_URL || publicEnv.NEXT_PUBLIC_MEDUSA_URL;
  }
  return publicEnv.NEXT_PUBLIC_MEDUSA_URL;
}
