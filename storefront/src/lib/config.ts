import Medusa from "@medusajs/js-sdk"

// Use MEDUSA_BACKEND_URL for server-side calls (internal Docker network)
// Use NEXT_PUBLIC_MEDUSA_BACKEND_URL for client-side calls (browser)
let MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
